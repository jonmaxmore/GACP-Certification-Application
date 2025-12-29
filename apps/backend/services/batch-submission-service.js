/**
 * Batch Submission Service
 * จัดการการ submit หลาย area types พร้อมกัน แล้ว auto-split เป็นหลาย applications
 * 
 * Logic: 1 Area Type = 1 Application = 1 Document Set = 1 Certificate
 * Payment: รวมเป็น 1 ครั้ง แต่แยก invoice per application
 */

const Application = require('../models-mongoose-legacy/application-model');
const { nanoid } = require('nanoid');
const { FEE_CONFIG } = require('../constants/PricingService');

/**
 * Generate unique batch ID
 */
function generateBatchId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `BATCH-${year}${month}-${nanoid(8).toUpperCase()}`;
}

/**
 * Generate application number
 */
async function generateApplicationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Count existing applications this month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0);

    const count = await Application.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `APP-${year}${month}-${sequence}`;
}

/**
 * Calculate fee for single area type
 * Formula: 30,000 per area type
 */
function calculateAreaFee(areaType) {
    return FEE_CONFIG.totalPerArea || 30000;
}

/**
 * Submit batch application - auto splits into multiple applications
 * 
 * @param {string} userId - User ID
 * @param {object} formData - Form data from wizard
 * @param {object} formData.sharedData - Data shared across all applications
 * @param {string} formData.sharedData.plantType - Type of plant
 * @param {string} formData.sharedData.objective - Certification objective
 * @param {object} formData.sharedData.applicantData - Applicant information
 * @param {string} formData.sharedData.licenseId - License ID
 * @param {object} formData.siteData - Site/location data
 * @param {string[]} formData.areaTypes - Array of selected area types
 * @param {object} formData.documents - Documents per area type
 * 
 * @returns {object} - Batch result with all created applications
 */
async function submitBatchApplication(userId, formData) {
    const { sharedData, siteData, areaTypes, documents } = formData;

    if (!areaTypes || areaTypes.length === 0) {
        throw new Error('ต้องเลือกลักษณะพื้นที่อย่างน้อย 1 ประเภท');
    }

    const batchId = generateBatchId();
    const applications = [];
    let totalFee = 0;

    // Create 1 application per area type
    for (let i = 0; i < areaTypes.length; i++) {
        const areaType = areaTypes[i];
        const applicationNumber = await generateApplicationNumber();
        const fee = calculateAreaFee(areaType);

        const appData = {
            applicationNumber,
            farmerId: userId,

            // Batch info
            batchId,
            areaTypeIndex: i,
            totalAreaTypes: areaTypes.length,

            // Shared data (copied to each application)
            plantType: sharedData.plantType,
            objective: sharedData.objective,
            applicantData: sharedData.applicantData,
            licenseId: sharedData.licenseId,

            // Site data (same site, different area type)
            siteData: siteData,

            // This application's specific area type
            areaType: areaType,

            // Documents for this area type
            documents: documents?.[areaType] || [],

            // Fee for this application
            fee: {
                amount: fee,
                currency: 'THB',
                breakdown: [
                    { description: `ค่าตรวจเอกสาร (${areaType})`, amount: 5000 },
                    { description: `ค่าตรวจประเมินแปลง (${areaType})`, amount: 25000 }
                ]
            },

            // Initial status
            status: 'DRAFT',
            serviceType: 'new_application'
        };

        const app = await Application.create(appData);
        applications.push(app);
        totalFee += fee;
    }

    return {
        success: true,
        batchId,
        applications: applications.map(app => ({
            _id: app._id,
            applicationNumber: app.applicationNumber,
            areaType: app.areaType,
            fee: app.fee.amount,
            status: app.status
        })),
        summary: {
            totalApplications: applications.length,
            areaTypes: areaTypes,
            totalFee,
            totalFeeText: `${totalFee.toLocaleString()} บาท`
        }
    };
}

/**
 * Get all applications in a batch
 */
async function getBatchApplications(batchId) {
    const applications = await Application.find({ batchId })
        .sort({ areaTypeIndex: 1 })
        .lean();

    if (applications.length === 0) {
        return null;
    }

    const totalFee = applications.reduce((sum, app) => sum + (app.fee?.amount || 0), 0);

    return {
        batchId,
        applications,
        summary: {
            totalApplications: applications.length,
            totalFee,
            statuses: applications.map(a => a.status)
        }
    };
}

/**
 * Update payment status for all applications in batch
 */
async function updateBatchPaymentStatus(batchId, paymentData) {
    const result = await Application.updateMany(
        { batchId },
        {
            $set: {
                'payment.status': paymentData.status,
                'payment.transactionId': paymentData.transactionId,
                'payment.paidAt': paymentData.paidAt,
                status: paymentData.status === 'paid' ? 'SUBMITTED' : 'PAYMENT_PENDING'
            }
        }
    );

    return {
        success: true,
        modifiedCount: result.modifiedCount
    };
}

/**
 * Check if user can submit new application for plant type
 * (must have verified license)
 */
async function canSubmitForPlant(userId, plantType) {
    const License = require('../models-mongoose-legacy/license-model');
    const license = await License.findByPlantType(userId, plantType);

    if (!license) {
        return {
            canSubmit: false,
            reason: 'ไม่พบใบอนุญาตสำหรับพืชชนิดนี้'
        };
    }

    if (license.verificationStatus !== 'verified') {
        return {
            canSubmit: false,
            reason: 'ใบอนุญาตยังไม่ได้รับการ verify'
        };
    }

    return {
        canSubmit: true,
        licenseId: license._id,
        licenseNumber: license.licenseNumber
    };
}

module.exports = {
    generateBatchId,
    generateApplicationNumber,
    calculateAreaFee,
    submitBatchApplication,
    getBatchApplications,
    updateBatchPaymentStatus,
    canSubmitForPlant
};

