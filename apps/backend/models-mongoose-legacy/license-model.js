/**
 * License Model - เก็บใบอนุญาตที่ Admin verify แล้ว
 * บท.11 = ปลูก, บท.13 = แปรรูป, บท.16 = ส่งออก
 * 1 ใบอนุญาต = 1 พืช (ถ้าต่างพืช ต้องคนละใบ)
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LicenseSchema = new Schema({
    // เจ้าของใบอนุญาต
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // ประเภทใบอนุญาต
    licenseType: {
        type: String,
        enum: ['BT11', 'BT13', 'BT16'],
        required: true
    },

    // เลขที่ใบอนุญาต
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },

    // ประเภทพืช (1 ใบ = 1 พืช)
    plantType: {
        type: String,
        enum: ['cannabis', 'kratom', 'turmeric', 'ginger', 'black_galangal', 'plai'],
        required: true
    },

    // วันที่ออกและหมดอายุ
    issuedDate: { type: Date },
    expiryDate: { type: Date },

    // เอกสารที่อัปโหลด (PDF/รูปภาพ)
    documentUrl: { type: String, required: true },
    documentName: { type: String },

    // สถานะการ verify โดย Admin
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },

    // แปลงที่อยู่ในใบอนุญาต (1 ใบอนุญาตมีได้หลายแปลง)
    sites: [{
        siteName: { type: String, required: true },
        siteAddress: String,
        province: String,
        district: String,
        subdistrict: String,
        postalCode: String,
        gpsLat: Number,
        gpsLng: Number,
        areaSize: Number,
        areaUnit: { type: String, default: 'rai' }
    }],

    // Metadata
    notes: String,
    isActive: { type: Boolean, default: true }

}, {
    timestamps: true,
    collection: 'licenses'
});

// Indexes
LicenseSchema.index({ userId: 1, plantType: 1 });
// Note: licenseNumber already has unique:true which creates index automatically
LicenseSchema.index({ verificationStatus: 1 });

// Virtual: ใบอนุญาตยังใช้ได้หรือไม่
LicenseSchema.virtual('isValid').get(function () {
    if (!this.expiryDate) return true;
    return new Date() < this.expiryDate && this.verificationStatus === 'verified';
});

// Virtual: วันที่เหลือก่อนหมดอายุ
LicenseSchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiryDate) return null;
    const now = new Date();
    const diff = this.expiryDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method: ตรวจสอบว่ามีแปลงนี้ในใบอนุญาตหรือไม่
LicenseSchema.methods.hasSite = function (siteName) {
    return this.sites.some(s => s.siteName === siteName);
};

// Statics: หาใบอนุญาตที่ verify แล้วของ user
LicenseSchema.statics.findVerifiedByUser = function (userId) {
    return this.find({
        userId,
        verificationStatus: 'verified',
        isActive: true
    });
};

// Statics: หาใบอนุญาตตามประเภทพืช
LicenseSchema.statics.findByPlantType = function (userId, plantType) {
    return this.findOne({
        userId,
        plantType,
        verificationStatus: 'verified',
        isActive: true
    });
};

const License = mongoose.model('License', LicenseSchema);

module.exports = License;

