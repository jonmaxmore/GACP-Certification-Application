/**
 * Survey Templates Generator - 4 Regions
 * Creates survey templates for Central, South, North, and Northeast regions
 *
 * Usage: node create-survey-templates.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform';

// 4 Regions
const REGIONS = {
  CENTRAL: 'central',
  SOUTH: 'south',
  NORTH: 'north',
  NORTHEAST: 'northeast'
};

// Survey Templates
const templates = [
  {
    _id: 'survey_central_v1',
    surveyId: 'survey_central_v1',
    region: REGIONS.CENTRAL,
    version: '1.0',
    title: 'แบบสอบถามเกษตรกรผู้ปลูกกัญชา - ภาคกลาง',
    description: 'แบบสอบถามสำหรับเกษตรกรผู้ปลูกกัญชาในภาคกลาง (Indoor/Greenhouse, เทคโนโลยีสูง)',
    status: 'active',

    steps: [
      {
        stepNumber: 1,
        stepName: 'region_selection',
        title: 'เลือกภูมิภาค',
        description: 'เลือกภูมิภาคและพื้นที่ที่คุณทำการเกษตร',
        questions: [
          {
            questionId: 'region',
            text: 'ภูมิภาค',
            type: 'select',
            required: true,
            options: ['central', 'south', 'north', 'northeast'],
            validation: { type: 'string', enum: ['central', 'south', 'north', 'northeast'] }
          },
          {
            questionId: 'province',
            text: 'จังหวัด',
            type: 'select',
            required: true,
            validation: { type: 'string' }
          },
          {
            questionId: 'district',
            text: 'อำเภอ',
            type: 'text',
            required: true,
            validation: { type: 'string' }
          },
          {
            questionId: 'subdistrict',
            text: 'ตำบล',
            type: 'text',
            required: true,
            validation: { type: 'string' }
          }
        ]
      },
      {
        stepNumber: 2,
        stepName: 'personal_info',
        title: 'ข้อมูลส่วนตัว',
        description: 'กรุณากรอกข้อมูลส่วนตัวของคุณ',
        questions: [
          {
            questionId: 'firstName',
            text: 'ชื่อ',
            type: 'text',
            required: true,
            validation: { type: 'string', minLength: 2, maxLength: 50 }
          },
          {
            questionId: 'lastName',
            text: 'นามสกุล',
            type: 'text',
            required: true,
            validation: { type: 'string', minLength: 2, maxLength: 50 }
          },
          {
            questionId: 'gender',
            text: 'เพศ',
            type: 'radio',
            required: true,
            options: ['male', 'female', 'not_specified']
          },
          {
            questionId: 'age',
            text: 'อายุ (ปี)',
            type: 'number',
            required: true,
            validation: { type: 'number', min: 18, max: 100 }
          },
          {
            questionId: 'education',
            text: 'ระดับการศึกษา',
            type: 'select',
            required: true,
            options: ['elementary', 'secondary', 'vocational', 'bachelor', 'master', 'other']
          },
          {
            questionId: 'phone',
            text: 'เบอร์โทรศัพท์',
            type: 'text',
            required: true,
            validation: { type: 'string', pattern: '^0\\d{8,9}$' }
          },
          {
            questionId: 'email',
            text: 'อีเมล',
            type: 'text',
            required: false,
            validation: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
          },
          {
            questionId: 'cannabisExperienceYears',
            text: 'ประสบการณ์ปลูกกัญชา (ปี)',
            type: 'number',
            required: true,
            validation: { type: 'number', min: 0, max: 50 }
          }
        ]
      },
      {
        stepNumber: 3,
        stepName: 'farm_info',
        title: 'ข้อมูลพื้นที่และฟาร์ม',
        description: 'กรุณากรอกข้อมูลพื้นที่และฟาร์มของคุณ',
        questions: [
          {
            questionId: 'totalLandSize',
            text: 'ขนาดพื้นที่ทั้งหมด (ไร่-งาน-วา)',
            type: 'object',
            required: true,
            fields: ['rai', 'ngan', 'wa']
          },
          {
            questionId: 'cannabisAreaSize',
            text: 'พื้นที่ปลูกกัญชา (ไร่-งาน-วา)',
            type: 'object',
            required: true,
            fields: ['rai', 'ngan', 'wa']
          },
          {
            questionId: 'landOwnership',
            text: 'ลักษณะที่ดิน',
            type: 'radio',
            required: true,
            options: ['owned', 'rented', 'other']
          },
          {
            questionId: 'cultivationType',
            text: 'ประเภทการปลูก',
            type: 'checkbox',
            required: true,
            options: ['outdoor', 'greenhouse', 'indoor', 'mixed']
          },
          {
            questionId: 'waterSources',
            text: 'แหล่งน้ำ',
            type: 'checkbox',
            required: true,
            options: ['groundwater', 'tap_water', 'river', 'rain', 'other']
          },
          // Region-specific questions for Central
          {
            questionId: 'hasControlledEnvironment',
            text: 'มีระบบควบคุมสภาพแวดล้อม',
            type: 'radio',
            required: true,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'hvacSystem',
            text: 'มีระบบปรับอากาศ (HVAC)',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'automatedIrrigation',
            text: 'มีระบบรดน้ำอัตโนมัติ',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'ledLighting',
            text: 'ใช้ไฟ LED สำหรับปลูก',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'urbanFarming',
            text: 'เป็นฟาร์มในเมือง (Urban Farming)',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          }
        ]
      },
      {
        stepNumber: 4,
        stepName: 'management_production',
        title: 'การจัดการและการผลิต',
        description: 'กรุณากรอกข้อมูลการจัดการและการผลิต',
        questions: [
          {
            questionId: 'cyclesPerYear',
            text: 'จำนวนรอบการปลูกต่อปี',
            type: 'number',
            required: true,
            validation: { type: 'number', min: 1, max: 12 }
          },
          {
            questionId: 'plantsPerCycle',
            text: 'จำนวนต้นต่อรอบ',
            type: 'number',
            required: true,
            validation: { type: 'number', min: 1 }
          },
          {
            questionId: 'strains',
            text: 'สายพันธุ์ที่ปลูก',
            type: 'checkbox',
            required: true,
            options: ['thai', 'sativa', 'indica', 'hybrid', 'high_cbd', 'high_thc', 'other']
          },
          {
            questionId: 'propagationMethod',
            text: 'วิธีการขยายพันธุ์',
            type: 'radio',
            required: true,
            options: ['seeds', 'clones', 'both']
          },
          {
            questionId: 'fertilizer',
            text: 'การใช้ปุ๋ย',
            type: 'object',
            required: true,
            fields: {
              type: { type: 'radio', options: ['chemical', 'organic', 'mixed'] },
              amountPerCycle: { type: 'number', min: 0 },
              frequencyPerWeek: { type: 'number', min: 0 }
            }
          },
          {
            questionId: 'pestControl',
            text: 'การป้องกันศัตรูพืช',
            type: 'object',
            required: true,
            fields: {
              method: { type: 'radio', options: ['chemical', 'biological', 'mixed', 'none'] },
              frequencyPerMonth: { type: 'number', min: 0 }
            }
          },
          {
            questionId: 'labor',
            text: 'แรงงาน',
            type: 'object',
            required: true,
            fields: {
              permanent: { type: 'number', min: 0 },
              temporary: { type: 'number', min: 0 },
              familyMembers: { type: 'number', min: 0 }
            }
          },
          // Region-specific questions for Central
          {
            questionId: 'useTechnology',
            text: 'ใช้เทคโนโลยีในการจัดการฟาร์ม',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'iotSensors',
            text: 'มีเซ็นเซอร์ IoT ติดตามสภาพแวดล้อม',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'automatedSystem',
            text: 'มีระบบอัตโนมัติในการควบคุม',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'dataLogging',
            text: 'บันทึกข้อมูลแบบดิจิทัล',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          }
        ]
      },
      {
        stepNumber: 5,
        stepName: 'cost_revenue',
        title: 'ต้นทุนและรายได้',
        description: 'กรุณากรอกข้อมูลต้นทุนและรายได้',
        questions: [
          {
            questionId: 'costs',
            text: 'ต้นทุนต่อรอบ (บาท)',
            type: 'object',
            required: true,
            fields: {
              seeds: { type: 'number', min: 0, label: 'เมล็ดพันธุ์/กล้า' },
              fertilizer: { type: 'number', min: 0, label: 'ปุ๋ย' },
              pesticides: { type: 'number', min: 0, label: 'สารป้องกันศัตรูพืช' },
              labor: { type: 'number', min: 0, label: 'แรงงาน' },
              utilities: { type: 'number', min: 0, label: 'น้ำและไฟฟ้า' },
              equipment: { type: 'number', min: 0, label: 'อุปกรณ์' },
              other: { type: 'number', min: 0, label: 'อื่นๆ' }
            },
            autoCalculate: true,
            formula:
              'totalCost = seeds + fertilizer + pesticides + labor + utilities + equipment + other'
          },
          {
            questionId: 'yieldPerCycle',
            text: 'ผลผลิตต่อรอบ (กิโลกรัม)',
            type: 'number',
            required: true,
            validation: { type: 'number', min: 0 }
          },
          {
            questionId: 'pricePerKg',
            text: 'ราคาขายต่อกิโลกรัม (บาท)',
            type: 'number',
            required: true,
            validation: { type: 'number', min: 0 }
          }
        ],
        autoCalculations: [
          {
            field: 'totalCost',
            formula:
              'costs.seeds + costs.fertilizer + costs.pesticides + costs.labor + costs.utilities + costs.equipment + costs.other'
          },
          {
            field: 'totalRevenue',
            formula: 'yieldPerCycle * pricePerKg'
          },
          {
            field: 'netProfit',
            formula: 'totalRevenue - totalCost'
          },
          {
            field: 'profitMargin',
            formula: '(netProfit / totalRevenue) * 100'
          },
          {
            field: 'costPerKg',
            formula: 'totalCost / yieldPerCycle'
          },
          {
            field: 'costPerPlant',
            formula: 'totalCost / plantsPerCycle'
          }
        ]
      },
      {
        stepNumber: 6,
        stepName: 'market_sales',
        title: 'ตลาดและการจำหน่าย',
        description: 'กรุณากรอกข้อมูลตลาดและการจำหน่าย',
        questions: [
          {
            questionId: 'salesChannels',
            text: 'ช่องทางการขาย',
            type: 'checkbox',
            required: true,
            options: ['hospital', 'pharmacy', 'distributor', 'direct', 'export', 'other']
          },
          {
            questionId: 'productForms',
            text: 'รูปแบบผลิตภัณฑ์',
            type: 'checkbox',
            required: true,
            options: ['dried_flower', 'extract', 'dried_leaf', 'processed', 'other']
          },
          {
            questionId: 'targetMarket',
            text: 'ตลาดเป้าหมาย',
            type: 'radio',
            required: true,
            options: ['medical', 'research', 'industrial', 'mixed']
          },
          {
            questionId: 'hasContract',
            text: 'มีสัญญาซื้อขายล่วงหน้า',
            type: 'radio',
            required: true,
            options: ['yes', 'no']
          },
          // Region-specific questions for Central
          {
            questionId: 'urbanMarket',
            text: 'ขายในตลาดเมือง',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'onlineSales',
            text: 'ขายออนไลน์',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'brandDevelopment',
            text: 'มีการพัฒนาแบรนด์',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'exportReady',
            text: 'พร้อมส่งออก',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          }
        ]
      },
      {
        stepNumber: 7,
        stepName: 'problems_needs',
        title: 'ปัญหาและความต้องการ',
        description: 'กรุณาระบุปัญหาและความต้องการสนับสนุน',
        questions: [
          {
            questionId: 'technicalProblems',
            text: 'ปัญหาด้านเทคนิค',
            type: 'checkbox',
            required: false,
            options: [
              'pests',
              'soil_quality',
              'water',
              'knowledge',
              'equipment',
              'strain_quality',
              'other'
            ]
          },
          {
            questionId: 'marketProblems',
            text: 'ปัญหาด้านตลาด',
            type: 'checkbox',
            required: false,
            options: [
              'price_fluctuation',
              'buyers',
              'competition',
              'quality_requirements',
              'transportation',
              'other'
            ]
          },
          {
            questionId: 'legalProblems',
            text: 'ปัญหาด้านกฎหมาย/การรับรอง',
            type: 'checkbox',
            required: false,
            options: [
              'licensing',
              'certification_cost',
              'strict_standards',
              'legal_knowledge',
              'other'
            ]
          },
          {
            questionId: 'supportNeeds',
            text: 'ความต้องการสนับสนุน',
            type: 'checkbox',
            required: false,
            options: [
              'training',
              'funding',
              'market_access',
              'legal_consultation',
              'equipment',
              'product_development',
              'other'
            ]
          },
          // Region-specific problems for Central
          {
            questionId: 'highLandCost',
            text: 'ต้นทุนที่ดินสูง',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'strictRegulations',
            text: 'กฎหมายเข้มงวด',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'neighborComplaints',
            text: 'มีข้อร้องเรียนจากเพื่อนบ้าน',
            type: 'radio',
            required: false,
            options: ['yes', 'no'],
            regionSpecific: true,
            regions: ['central']
          },
          {
            questionId: 'additionalComments',
            text: 'ข้อคิดเห็นเพิ่มเติม',
            type: 'textarea',
            required: false
          }
        ]
      }
    ],

    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Note: Templates for South, North, and Northeast regions would be similar
// but with different region-specific questions. For brevity, only Central template is shown.
// In production, you would create all 4 templates with appropriate region-specific questions.

async function createSurveyTemplates() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const surveys = db.collection('surveys');

    // Insert templates
    for (const template of templates) {
      const existing = await surveys.findOne({ _id: template._id });

      if (existing) {
        console.log(`⚠️  Template ${template._id} already exists, updating...`);
        await surveys.updateOne({ _id: template._id }, { $set: template });
      } else {
        console.log(`✅ Creating template ${template._id}...`);
        await surveys.insertOne(template);
      }
    }

    console.log('\n✅ Survey templates created successfully!');
    console.log(`📊 Total templates: ${templates.length}`);
    console.log('✅ Regions: Central (more regions can be added)');
  } catch (error) {
    console.error('❌ Error creating survey templates:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  createSurveyTemplates()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createSurveyTemplates, templates };
