/**
 * Seed Geography Script
 * Imports Thai geography data (Provinces, Districts, Subdistricts) into the database.
 * For demonstration, we will seed a subset of data (Chiang Mai).
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema inline for simplicity, or import if you have a model file
const GeographySchema = new mongoose.Schema({
  provinceCode: { type: String, required: true },
  provinceNameEn: { type: String, required: true },
  provinceNameTh: { type: String, required: true },
  districts: [{
    districtCode: { type: String, required: true },
    districtNameEn: { type: String, required: true },
    districtNameTh: { type: String, required: true },
    subdistricts: [{
      subdistrictCode: { type: String, required: true },
      subdistrictNameEn: { type: String, required: true },
      subdistrictNameTh: { type: String, required: true },
      zipCode: { type: String, required: true }
    }]
  }]
});

const Geography = mongoose.models.Geography || mongoose.model('Geography', GeographySchema);

// Sample Data: Chiang Mai
const chiangMaiData = {
  provinceCode: '50',
  provinceNameEn: 'Chiang Mai',
  provinceNameTh: 'เชียงใหม่',
  districts: [
    {
      districtCode: '5001',
      districtNameEn: 'Mueang Chiang Mai',
      districtNameTh: 'เมืองเชียงใหม่',
      subdistricts: [
        { subdistrictCode: '500101', subdistrictNameEn: 'Si Phum', subdistrictNameTh: 'ศรีภูมิ', zipCode: '50200' },
        { subdistrictCode: '500102', subdistrictNameEn: 'Phra Sing', subdistrictNameTh: 'พระสิงห์', zipCode: '50200' },
        { subdistrictCode: '500103', subdistrictNameEn: 'Hai Ya', subdistrictNameTh: 'หายยา', zipCode: '50100' }
      ]
    },
    {
      districtCode: '5002',
      districtNameEn: 'Chom Thong',
      districtNameTh: 'จอมทอง',
      subdistricts: [
        { subdistrictCode: '500201', subdistrictNameEn: 'Ban Luang', subdistrictNameTh: 'บ้านหลวง', zipCode: '50160' },
        { subdistrictCode: '500202', subdistrictNameEn: 'Khuang Pao', subdistrictNameTh: 'ข่วงเปา', zipCode: '50160' }
      ]
    }
  ]
};

async function seedGeography() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await Geography.deleteMany({});
    console.log('Cleared existing geography data.');

    // Insert sample data
    await Geography.create(chiangMaiData);
    console.log('✅ Seeded Chiang Mai geography data.');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seedGeography();
