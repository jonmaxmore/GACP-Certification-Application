const { prisma } = require('./prisma-database');
const QRCode = require('qrcode');

/**
 * Service for managing Farms/Establishments
 */
class FarmService {

    /**
     * Get all farms for a specific farmer
     * @param {string} ownerId 
     */
    async getByOwner(ownerId) {
        return prisma.farm.findMany({
            where: {
                ownerId,
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                uuid: true,
                farmName: true,
                farmType: true,
                address: true,
                province: true,
                district: true,
                subDistrict: true,
                postalCode: true,
                latitude: true,
                longitude: true,
                totalArea: true,
                cultivationArea: true,
                areaUnit: true,
                cultivationMethod: true,
                irrigationType: true,
                soilType: true,
                waterSource: true,
                status: true,
                verifiedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Get single farm by ID with ownership check
     * @param {string} id 
     * @param {string} ownerId 
     */
    async getById(id, ownerId) {
        return prisma.farm.findFirst({
            where: {
                id,
                ownerId,
                isDeleted: false,
            },
            include: {
                plantingCycles: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                harvestBatches: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
    }

    /**
     * Create a new farm
     * @param {string} ownerId 
     * @param {object} data 
     * @param {object} file (Optional uploaded file)
     */
    async createFarm(ownerId, data, file) {
        const {
            farmName, farmType, address, province, district, subDistrict, postalCode,
            latitude, longitude, totalArea, cultivationArea, areaUnit,
            cultivationMethod, irrigationType, soilType, waterSource, landDocuments
        } = data;

        return prisma.farm.create({
            data: {
                ownerId,
                farmName,
                farmType: farmType || 'CULTIVATION',
                address,
                province,
                district,
                subDistrict,
                postalCode: postalCode || '',
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                totalArea: totalArea ? parseFloat(totalArea) : 0,
                cultivationArea: cultivationArea ? parseFloat(cultivationArea) : 0,
                areaUnit: areaUnit || 'rai',
                cultivationMethod: cultivationMethod || 'OUTDOOR',
                irrigationType,
                soilType,
                waterSource,
                // Handle file upload or JSON body
                landDocuments: file ? {
                    images: [`/uploads/${file.filename}`],
                } : (landDocuments || null),
                status: 'DRAFT',
            },
        });
    }

    /**
     * Update farm details
     * @param {string} id 
     * @param {string} ownerId 
     * @param {object} data 
     */
    async updateFarm(id, ownerId, data) {
        // Check ownership
        const existing = await this.getById(id, ownerId);
        if (!existing) return null;

        const updateData = {};
        const allowedFields = [
            'farmName', 'farmType', 'address', 'province', 'district',
            'subDistrict', 'postalCode', 'latitude', 'longitude',
            'totalArea', 'cultivationArea', 'areaUnit', 'cultivationMethod',
            'irrigationType', 'soilType', 'waterSource', 'landDocuments',
            'sanitationInfo', 'siteHistory' // [NEW] GACP Fields
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        // Parse numeric fields
        if (updateData.latitude) { updateData.latitude = parseFloat(updateData.latitude); }
        if (updateData.longitude) { updateData.longitude = parseFloat(updateData.longitude); }
        if (updateData.totalArea) { updateData.totalArea = parseFloat(updateData.totalArea); }
        if (updateData.cultivationArea) { updateData.cultivationArea = parseFloat(updateData.cultivationArea); }

        return prisma.farm.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Soft delete farm
     * @param {string} id 
     * @param {string} ownerId 
     */
    async deleteFarm(id, ownerId) {
        const existing = await this.getById(id, ownerId);
        if (!existing) return false;

        await prisma.farm.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: ownerId,
            },
        });
        return true;
    }

    /**
     * Generate QR Code HTML
     * @param {string} id 
     * @param {string} ownerId 
     */
    async generateQRCode(id, ownerId) {
        const farm = await this.getById(id, ownerId);
        if (!farm) return null;

        const publicUrl = `${process.env.PUBLIC_APP_URL || 'https://gacp.dtam.go.th'}/verify/farm/${farm.id}`;
        const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 400, margin: 2 });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code: ${farm.farmName}</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Sarabun', sans-serif; text-align: center; padding: 20px; }
                    .sticker { 
                        border: 2px solid #2E7D32; 
                        border-radius: 10px;
                        padding: 20px; 
                        width: 300px; 
                        margin: 0 auto; 
                        text-align: center;
                    }
                    h2 { color: #2E7D32; margin: 10px 0; font-size: 1.2em; }
                    h3 { color: #555; margin: 5px 0; font-size: 1em; font-weight: normal; }
                    img { width: 200px; height: 200px; }
                    .footer { font-size: 0.8em; color: #888; margin-top: 10px; }
                    @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                        .sticker { border: none; } 
                    }
                </style>
            </head>
            <body>
                <div class="sticker">
                    <h2>GACP THAILAND</h2>
                    <h3>${farm.farmName}</h3>
                    <img src="${qrDataUrl}" alt="Farm QR Code" />
                    <div class="footer">Scan to verify farm status</div>
                    <div class="footer">ID: ${farm.id}</div>
                </div>
                <div class="no-print" style="margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #2E7D32; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Sticker</button>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = new FarmService();
