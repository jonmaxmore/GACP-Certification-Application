/**
 * License Routes - API สำหรับจัดการใบอนุญาต
 * 
 * NOTE: License verification is NO LONGER separate from document review!
 * เอกสารใบอนุญาตจะถูกรีวิวพร้อมกับเอกสารอื่นใน Phase 1 (5,000 บาท × area)
 * 
 * Routes นี้เก็บไว้เพื่อ:
 * 1. User upload license (stored as attachment in application)
 * 2. User view their licenses
 * 3. Check if license is valid
 */

const express = require('express');
const router = express.Router();
const License = require('../../../database/models/license-model');

/**
 * @route POST /api/v2/licenses
 * @description User อัปโหลดใบอนุญาต (optional - จะ link ไปที่ application หรือเก็บเป็น reference)
 */
router.post('/', async (req, res) => {
    try {
        const {
            licenseType,
            licenseNumber,
            plantType,
            issuedDate,
            expiryDate,
            documentUrl,
            sites
        } = req.body;

        const userId = req.body.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'กรุณาเข้าสู่ระบบ'
            });
        }

        // Check if license number already exists
        const existing = await License.findOne({ licenseNumber });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'เลขที่ใบอนุญาตนี้มีอยู่ในระบบแล้ว'
            });
        }

        const license = await License.create({
            userId,
            licenseType,
            licenseNumber,
            plantType,
            issuedDate,
            expiryDate,
            documentUrl,
            sites: sites || [],
            // Auto-verified: ไม่ต้องมี admin verify แยก
            // License จะถูกตรวจพร้อมกับเอกสารอื่นใน document review
            verificationStatus: 'pending' // จะเปลี่ยนเป็น verified เมื่อ application ผ่าน Phase 1
        });

        res.status(201).json({
            success: true,
            message: 'บันทึกข้อมูลใบอนุญาตเรียบร้อย',
            data: license
        });
    } catch (error) {
        console.error('Create license error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถบันทึกใบอนุญาตได้'
        });
    }
});

/**
 * @route GET /api/v2/licenses/my
 * @description Get user's licenses
 */
router.get('/my', async (req, res) => {
    try {
        const userId = req.query.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'กรุณาเข้าสู่ระบบ'
            });
        }

        const licenses = await License.find({ userId, isActive: true })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: licenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถดึงข้อมูลใบอนุญาตได้'
        });
    }
});

/**
 * @route GET /api/v2/licenses/check/:plantType
 * @description Check if user has any license for plant type
 */
router.get('/check/:plantType', async (req, res) => {
    try {
        const userId = req.query.userId || req.user?._id;
        const { plantType } = req.params;

        const license = await License.findOne({
            userId,
            plantType: plantType.toLowerCase(),
            isActive: true
        });

        if (!license) {
            return res.json({
                success: true,
                data: {
                    hasLicense: false,
                    message: 'ไม่พบใบอนุญาตสำหรับพืชชนิดนี้'
                }
            });
        }

        res.json({
            success: true,
            data: {
                hasLicense: true,
                licenseId: license._id,
                licenseNumber: license.licenseNumber,
                expiryDate: license.expiryDate,
                note: 'ใบอนุญาตจะถูกตรวจสอบพร้อมกับเอกสารอื่นในขั้นตอน Document Review'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
});

/**
 * @route GET /api/v2/licenses/required/:plantType
 * @description Get required license types for a plant type
 */
router.get('/required/:plantType', (req, res) => {
    const { plantType } = req.params;
    const plant = plantType.toLowerCase();

    // Only cannabis and kratom require special licenses
    const highControlPlants = ['cannabis', 'kratom', 'กัญชา', 'กระท่อม'];

    if (highControlPlants.includes(plant)) {
        res.json({
            success: true,
            data: {
                requiresLicense: true,
                requiredTypes: ['BT11'], // ใบอนุญาตปลูก
                optionalTypes: ['BT13', 'BT16'], // แปรรูป, ส่งออก
                note: 'แนบเอกสารใบอนุญาตใน application form เพื่อตรวจพร้อมกัน'
            }
        });
    } else {
        res.json({
            success: true,
            data: {
                requiresLicense: false,
                requiredTypes: [],
                note: 'พืชนี้ไม่ต้องการใบอนุญาตพิเศษ'
            }
        });
    }
});

module.exports = router;
