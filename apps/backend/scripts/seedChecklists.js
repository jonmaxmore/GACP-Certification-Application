/**
 * Seed Checklists Script
 * Seeds standard GACP audit checklists into the database.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema inline
const ChecklistSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  version: { type: String, required: true },
  sections: [{
    title: { type: String, required: true },
    items: [{
      id: { type: String, required: true },
      question: { type: String, required: true },
      guidance: String,
      critical: { type: Boolean, default: false }
    }]
  }],
  active: { type: Boolean, default: true }
});

const AuditChecklist = mongoose.models.AuditChecklist || mongoose.model('AuditChecklist', ChecklistSchema);

const gacpChecklist = {
  code: 'GACP-V1',
  title: 'GACP Standard Checklist',
  version: '1.0',
  sections: [
    {
      title: '1. Personnel',
      items: [
        { id: '1.1', question: 'Are personnel adequately trained in GACP practices?', guidance: 'Check training records.', critical: true },
        { id: '1.2', question: 'Is there a hygiene policy in place?', guidance: 'Verify written policy and implementation.', critical: true }
      ]
    },
    {
      title: '2. Buildings and Facilities',
      items: [
        { id: '2.1', question: 'Are facilities clean and free from pests?', guidance: 'Inspect storage and processing areas.', critical: true },
        { id: '2.2', question: 'Is there adequate ventilation?', guidance: 'Check air flow systems.', critical: false }
      ]
    },
    {
      title: '3. Equipment',
      items: [
        { id: '3.1', question: 'Is equipment clean and maintained?', guidance: 'Check maintenance logs.', critical: true }
      ]
    }
  ]
};

async function seedChecklists() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await AuditChecklist.deleteMany({});
    console.log('Cleared existing checklists.');

    // Insert data
    await AuditChecklist.create(gacpChecklist);
    console.log('✅ Seeded GACP checklist.');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seedChecklists();
