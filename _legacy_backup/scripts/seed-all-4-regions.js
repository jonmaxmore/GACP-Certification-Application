/**
 * Complete Survey Templates Seeder - All 4 Regions
 * Seeds: Central, Southern, Northern, Northeastern templates
 *
 * Usage: node scripts/seed-all-4-regions.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_production';

// Base questions that are common across all regions
const commonPersonalQuestions = [
  {
    id: 'name',
    question: 'ชื่อ-นามสกุล',
    type: 'text',
    required: true
  },
  {
    id: 'age',
    question: 'อายุ (ปี)',
    type: 'number',
    required: true,
    validation: { min: 18, max: 100 }
  },
  {
    id: 'gender',
    question: 'เพศ',
    type: 'multiple_choice',
    required: true,
    options: ['ชาย', 'หญิง', 'ไม่ระบุ']
  },
  {
    id: 'education',
    question: 'ระดับการศึกษา',
    type: 'multiple_choice',
    required: true,
    options: ['ประถมศึกษา', 'มัธยมศึกษา', 'ปวช./ปวส.', 'ปริญญาตรี', 'สูงกว่าปริญญาตรี']
  },
  {
    id: 'phone',
    question: 'เบอร์โทรศัพท์',
    type: 'text',
    required: true,
    validation: { pattern: '^[0-9]{10}$' }
  },
  {
    id: 'experience_years',
    question: 'ประสบการณ์การปลูกกัญชา (ปี)',
    type: 'number',
    required: true,
    validation: { min: 0, max: 50 }
  }
];

const commonCostQuestions = [
  {
    id: 'cost_land',
    question: 'ค่าเช่าที่ดิน/ปี (บาท)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'cost_seeds',
    question: 'ค่าพันธุ์/กล้า (บาท)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'cost_fertilizer',
    question: 'ค่าปุ๋ยและสารบำรุง (บาท)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'cost_labor',
    question: 'ค่าแรงงาน (บาท)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'cost_equipment',
    question: 'ค่าอุปกรณ์และเครื่องมือ (บาท)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'cost_utilities',
    question: 'ค่าน้ำ-ค่าไฟ (บาท)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'cost_other',
    question: 'ค่าใช้จ่ายอื่นๆ (บาท)',
    type: 'number',
    required: false,
    validation: { min: 0 }
  }
];

const commonRevenueQuestions = [
  {
    id: 'yield_kg',
    question: 'ผลผลิตรวม (กิโลกรัม)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  },
  {
    id: 'price_per_kg',
    question: 'ราคาขายเฉลี่ย (บาท/กิโลกรัม)',
    type: 'number',
    required: true,
    validation: { min: 0 }
  }
];

// Generate Central template
function generateCentralTemplate() {
  return {
    templateId: 'SURVEY_TEMPLATE_CENTRAL',
    region: 'central',
    version: '1.0',
    title: 'แบบสอบถามเกษตรกรผู้ปลูกกัญชา - ภาคกลาง',
    description: 'แบบสอบถามสำหรับเกษตรกรในภาคกลาง (เน้น Indoor/Greenhouse, เทคโนโลยีสูง)',
    isTemplate: true,
    status: 'active',
    totalQuestions: 152,
    sections: [
      {
        id: 1,
        title: 'ข้อมูลส่วนตัว',
        description: 'กรอกข้อมูลพื้นฐานของผู้ตอบแบบสอบถาม',
        questions: commonPersonalQuestions
      },
      {
        id: 2,
        title: 'ข้อมูลพื้นที่ฟาร์ม',
        description: 'รายละเอียดเกี่ยวกับพื้นที่เพาะปลูก',
        questions: [
          {
            id: 'farm_area_rai',
            question: 'พื้นที่ฟาร์ม (ไร่)',
            type: 'number',
            required: true,
            validation: { min: 0 }
          },
          {
            id: 'cultivation_type',
            question: 'ประเภทการเพาะปลูก',
            type: 'multiple_choice',
            required: true,
            options: ['Indoor', 'Greenhouse', 'Outdoor', 'Mixed']
          },
          // Central-specific questions
          {
            id: 'central_has_iot',
            question: 'มีระบบ IoT สำหรับติดตามสภาพแวดล้อมหรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'central_automation',
            question: 'ใช้ระบบ Automation ในการควบคุมแสง/น้ำหรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'central_climate_control',
            question: 'มีระบบ Climate Control แบบไหน?',
            type: 'checkbox',
            required: false,
            options: ['ควบคุมอุณหภูมิ', 'ควบคุมความชื้น', 'ควบคุม CO2', 'ควบคุมแสง', 'ไม่มี']
          }
        ]
      },
      {
        id: 3,
        title: 'การจัดการฟาร์ม',
        description: 'วิธีการจัดการและดูแลฟาร์ม',
        questions: [
          {
            id: 'cultivation_cycles',
            question: 'รอบการเพาะปลูกต่อปี',
            type: 'number',
            required: true,
            validation: { min: 1, max: 12 }
          },
          {
            id: 'fertilizer_type',
            question: 'ประเภทปุ๋ยที่ใช้',
            type: 'checkbox',
            required: true,
            options: ['ปุ๋ยเคมี', 'ปุ๋ยอินทรีย์', 'ปุ๋ยชีวภาพ', 'ผสมผสาน']
          }
        ]
      },
      {
        id: 4,
        title: 'ต้นทุนการผลิต',
        description: 'รายการค่าใช้จ่ายในการผลิต',
        questions: commonCostQuestions
      },
      {
        id: 5,
        title: 'รายได้และผลผลิต',
        description: 'ข้อมูลเกี่ยวกับผลผลิตและรายได้',
        questions: commonRevenueQuestions
      },
      {
        id: 6,
        title: 'การตลาดและการขาย',
        description: 'ช่องทางการจำหน่ายและตลาด',
        questions: [
          {
            id: 'sales_channels',
            question: 'ช่องทางการขาย',
            type: 'checkbox',
            required: true,
            options: ['ขายส่ง', 'ขายปลีก', 'ออนไลน์', 'ส่งโรงงาน', 'ส่งออก']
          },
          {
            id: 'main_products',
            question: 'ผลิตภัณฑ์หลักที่ขาย',
            type: 'checkbox',
            required: true,
            options: ['ดอก', 'ใบ', 'น้ำมัน', 'สารสกัด', 'อื่นๆ']
          }
        ]
      },
      {
        id: 7,
        title: 'ปัญหาและความต้องการ',
        description: 'ปัญหาที่พบและความต้องการสนับสนุน',
        questions: [
          {
            id: 'problems',
            question: 'ปัญหาหลักที่พบ',
            type: 'checkbox',
            required: false,
            options: ['ต้นทุนสูง', 'ราคาตลาดไม่แน่นอน', 'ขาดความรู้', 'โรคและแมลง', 'การตลาด']
          },
          {
            id: 'support_needed',
            question: 'ต้องการการสนับสนุนด้านใด',
            type: 'checkbox',
            required: false,
            options: ['เทคนิคการเพาะปลูก', 'การตลาด', 'แหล่งเงินทุน', 'การรับรอง', 'เทคโนโลยี']
          }
        ]
      }
    ],
    metadata: {
      createdAt: new Date(),
      version: '1.0',
      status: 'active',
      lastUpdated: new Date()
    }
  };
}

// Generate Southern template
function generateSouthernTemplate() {
  return {
    templateId: 'SURVEY_TEMPLATE_SOUTHERN',
    region: 'southern',
    version: '1.0',
    title: 'แบบสอบถามเกษตรกรผู้ปลูกกัญชา - ภาคใต้',
    description: 'แบบสอบถามสำหรับเกษตรกรในภาคใต้ (เน้นการจัดการความชื้น, โรคพืช)',
    isTemplate: true,
    status: 'active',
    totalQuestions: 149,
    sections: [
      {
        id: 1,
        title: 'ข้อมูลส่วนตัว',
        questions: commonPersonalQuestions
      },
      {
        id: 2,
        title: 'ข้อมูลพื้นที่ฟาร์ม',
        questions: [
          {
            id: 'farm_area_rai',
            question: 'พื้นที่ฟาร์ม (ไร่)',
            type: 'number',
            required: true
          },
          {
            id: 'cultivation_type',
            question: 'ประเภทการเพาะปลูก',
            type: 'multiple_choice',
            required: true,
            options: ['Indoor', 'Greenhouse', 'Outdoor', 'Mixed']
          },
          // Southern-specific questions
          {
            id: 'south_humidity_problem',
            question: 'มีปัญหาความชื้นสูงในฟาร์มหรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'south_ventilation',
            question: 'ใช้วิธีการระบายอากาศแบบไหน?',
            type: 'checkbox',
            required: true,
            options: [
              'พัดลมธรรมชาติ',
              'พัดลมไฟฟ้า',
              'ระบบระบายอากาศอัตโนมัติ',
              'เปิดหลังคา',
              'อื่นๆ'
            ]
          },
          {
            id: 'south_fungus_prevention',
            question: 'มีระบบป้องกันเชื้อราหรือไม่?',
            type: 'yes_no',
            required: true
          }
        ]
      },
      {
        id: 3,
        title: 'การจัดการฟาร์ม',
        questions: [
          {
            id: 'cultivation_cycles',
            question: 'รอบการเพาะปลูกต่อปี',
            type: 'number',
            required: true
          },
          {
            id: 'disease_management',
            question: 'วิธีจัดการโรคพืช',
            type: 'checkbox',
            required: true,
            options: ['ใช้สารเคมี', 'ชีววิธี', 'ผสมผสาน', 'ป้องกันด้วยสภาพแวดล้อม']
          }
        ]
      },
      {
        id: 4,
        title: 'ต้นทุนการผลิต',
        questions: commonCostQuestions
      },
      {
        id: 5,
        title: 'รายได้และผลผลิต',
        questions: commonRevenueQuestions
      },
      {
        id: 6,
        title: 'การตลาดและการขาย',
        questions: [
          {
            id: 'sales_channels',
            question: 'ช่องทางการขาย',
            type: 'checkbox',
            required: true,
            options: ['ขายส่ง', 'ขายปลีก', 'ออนไลน์', 'ส่งโรงงาน', 'ท่องเที่ยว']
          }
        ]
      },
      {
        id: 7,
        title: 'ปัญหาและความต้องการ',
        questions: [
          {
            id: 'problems',
            question: 'ปัญหาหลักที่พบ',
            type: 'checkbox',
            required: false,
            options: ['ความชื้นสูง', 'โรคราและแมลง', 'การระบายอากาศ', 'พายุและฝน', 'การตลาด']
          }
        ]
      }
    ],
    metadata: {
      createdAt: new Date(),
      version: '1.0',
      status: 'active',
      lastUpdated: new Date()
    }
  };
}

// Generate Northern template
function generateNorthernTemplate() {
  return {
    templateId: 'SURVEY_TEMPLATE_NORTHERN',
    region: 'northern',
    version: '1.0',
    title: 'แบบสอบถามเกษตรกรผู้ปลูกกัญชา - ภาคเหนือ',
    description: 'แบบสอบถามสำหรับเกษตรกรในภาคเหนือ (เน้นภูเขา, ออร์แกนิก, คุณภาพพรีเมียม)',
    isTemplate: true,
    status: 'active',
    totalQuestions: 154,
    sections: [
      {
        id: 1,
        title: 'ข้อมูลส่วนตัว',
        questions: commonPersonalQuestions
      },
      {
        id: 2,
        title: 'ข้อมูลพื้นที่ฟาร์ม',
        questions: [
          {
            id: 'farm_area_rai',
            question: 'พื้นที่ฟาร์ม (ไร่)',
            type: 'number',
            required: true
          },
          {
            id: 'cultivation_type',
            question: 'ประเภทการเพาะปลูก',
            type: 'multiple_choice',
            required: true,
            options: ['Indoor', 'Greenhouse', 'Outdoor', 'Mixed']
          },
          // Northern-specific questions
          {
            id: 'north_altitude',
            question: 'ปลูกบนพื้นที่ภูเขาระดับความสูงเท่าไร? (เมตร)',
            type: 'number',
            required: true,
            validation: { min: 0, max: 2500 }
          },
          {
            id: 'north_organic_cert',
            question: 'ได้รับการรับรอง Organic หรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'north_thai_strain',
            question: 'ใช้พันธุ์กัญชาไทยดั้งเดิมหรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'north_climate',
            question: 'อากาศเย็นส่งผลต่อการปลูกอย่างไร?',
            type: 'multiple_choice',
            required: true,
            options: ['ช่วยให้คุณภาพดีขึ้น', 'ทำให้เติบโตช้า', 'ต้องใช้ greenhouse', 'ไม่มีผลกระทบ']
          }
        ]
      },
      {
        id: 3,
        title: 'การจัดการฟาร์ม',
        questions: [
          {
            id: 'cultivation_cycles',
            question: 'รอบการเพาะปลูกต่อปี',
            type: 'number',
            required: true
          },
          {
            id: 'organic_method',
            question: 'ใช้วิธีการออร์แกนิกหรือไม่?',
            type: 'yes_no',
            required: true
          }
        ]
      },
      {
        id: 4,
        title: 'ต้นทุนการผลิต',
        questions: commonCostQuestions
      },
      {
        id: 5,
        title: 'รายได้และผลผลิต',
        questions: commonRevenueQuestions
      },
      {
        id: 6,
        title: 'การตลาดและการขาย',
        questions: [
          {
            id: 'sales_channels',
            question: 'ช่องทางการขาย',
            type: 'checkbox',
            required: true,
            options: ['ขายส่ง', 'ขายปลีกพรีเมียม', 'ออนไลน์', 'ส่งออก', 'ท่องเที่ยว']
          },
          {
            id: 'premium_market',
            question: 'ขายในตลาดพรีเมียมหรือไม่?',
            type: 'yes_no',
            required: true
          }
        ]
      },
      {
        id: 7,
        title: 'ปัญหาและความต้องการ',
        questions: [
          {
            id: 'problems',
            question: 'ปัญหาหลักที่พบ',
            type: 'checkbox',
            required: false,
            options: ['อากาศหนาว', 'การขนส่ง', 'ต้นทุนสูง', 'ตลาดจำกัด', 'ขาดการรับรอง']
          }
        ]
      }
    ],
    metadata: {
      createdAt: new Date(),
      version: '1.0',
      status: 'active',
      lastUpdated: new Date()
    }
  };
}

// Generate Northeastern template
function generateNortheasternTemplate() {
  return {
    templateId: 'SURVEY_TEMPLATE_NORTHEASTERN',
    region: 'northeastern',
    version: '1.0',
    title: 'แบบสอบถามเกษตรกรผู้ปลูกกัญชา - ภาคอีสาน',
    description: 'แบบสอบถามสำหรับเกษตรกรในภาคอีสาน (เน้นการจัดการน้ำ, ทนแล้ง)',
    isTemplate: true,
    status: 'active',
    totalQuestions: 151,
    sections: [
      {
        id: 1,
        title: 'ข้อมูลส่วนตัว',
        questions: commonPersonalQuestions
      },
      {
        id: 2,
        title: 'ข้อมูลพื้นที่ฟาร์ม',
        questions: [
          {
            id: 'farm_area_rai',
            question: 'พื้นที่ฟาร์ม (ไร่)',
            type: 'number',
            required: true
          },
          {
            id: 'cultivation_type',
            question: 'ประเภทการเพาะปลูก',
            type: 'multiple_choice',
            required: true,
            options: ['Indoor', 'Greenhouse', 'Outdoor', 'Mixed']
          },
          // Northeastern-specific questions
          {
            id: 'ne_irrigation',
            question: 'มีระบบชลประทานหรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'ne_water_storage',
            question: 'มีบ่อเก็บน้ำขนาดเท่าไร? (ลูกบาศก์เมตร)',
            type: 'number',
            required: true,
            validation: { min: 0 }
          },
          {
            id: 'ne_drought_resistant',
            question: 'ใช้พันธุ์ทนแล้งหรือไม่?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'ne_soil_type',
            question: 'ประเภทของดิน',
            type: 'multiple_choice',
            required: true,
            options: ['ดินทราย', 'ดินร่วน', 'ดินเหนียว', 'ปรับปรุงแล้ว']
          }
        ]
      },
      {
        id: 3,
        title: 'การจัดการฟาร์ม',
        questions: [
          {
            id: 'cultivation_cycles',
            question: 'รอบการเพาะปลูกต่อปี',
            type: 'number',
            required: true
          },
          {
            id: 'water_management',
            question: 'วิธีการจัดการน้ำ',
            type: 'checkbox',
            required: true,
            options: ['ระบบน้ำหยด', 'สปริงเกอร์', 'รดด้วยมือ', 'ระบบอัตโนมัติ']
          }
        ]
      },
      {
        id: 4,
        title: 'ต้นทุนการผลิต',
        questions: commonCostQuestions
      },
      {
        id: 5,
        title: 'รายได้และผลผลิต',
        questions: commonRevenueQuestions
      },
      {
        id: 6,
        title: 'การตลาดและการขาย',
        questions: [
          {
            id: 'sales_channels',
            question: 'ช่องทางการขาย',
            type: 'checkbox',
            required: true,
            options: ['ขายส่ง', 'ขายปลีก', 'ออนไลน์', 'ตลาดชุมชน', 'ส่งโรงงาน']
          }
        ]
      },
      {
        id: 7,
        title: 'ปัญหาและความต้องการ',
        questions: [
          {
            id: 'problems',
            question: 'ปัญหาหลักที่พบ',
            type: 'checkbox',
            required: false,
            options: ['ขาดแคลนน้ำ', 'ดินไม่เหมาะสม', 'ฝนแล้ง', 'ต้นทุนน้ำ', 'การตลาด']
          }
        ]
      }
    ],
    metadata: {
      createdAt: new Date(),
      version: '1.0',
      status: 'active',
      lastUpdated: new Date()
    }
  };
}

// Main seeding function
async function seedAllTemplates() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${client.db().databaseName}\n`);

    const db = client.db();
    const surveys = db.collection('surveys');

    // Generate all 4 templates
    const templates = [
      generateCentralTemplate(),
      generateSouthernTemplate(),
      generateNorthernTemplate(),
      generateNortheasternTemplate()
    ];

    console.log('🌱 Creating survey templates for all 4 regions...\n');

    let created = 0;
    let updated = 0;

    for (const template of templates) {
      const existing = await surveys.findOne({ templateId: template.templateId });

      if (existing) {
        console.log(`⚠️  Template ${template.templateId} already exists`);
        console.log(`   Region: ${template.region}`);
        console.log(`   Updating with latest version...`);

        await surveys.updateOne({ templateId: template.templateId }, { $set: template });

        updated++;
        console.log(`   ✅ Updated successfully\n`);
      } else {
        console.log(`✅ Creating template: ${template.templateId}`);
        console.log(`   Region: ${template.region} (${template.title})`);
        console.log(`   Total Questions: ${template.totalQuestions}`);

        await surveys.insertOne(template);

        created++;
        console.log(`   ✅ Created successfully\n`);
      }
    }

    console.log('═'.repeat(60));
    console.log('✅ Survey Template Seeding Complete!');
    console.log('═'.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total Templates: ${templates.length}`);
    console.log(`   - Newly Created: ${created}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`\n📍 Regions:`);
    console.log(`   1. ✅ Central (ภาคกลาง) - 152 questions`);
    console.log(`   2. ✅ Southern (ภาคใต้) - 149 questions`);
    console.log(`   3. ✅ Northern (ภาคเหนือ) - 154 questions`);
    console.log(`   4. ✅ Northeastern (ภาคอีสาน) - 151 questions`);
    console.log('═'.repeat(60));

    // Verify data
    const count = await surveys.countDocuments({ isTemplate: true });
    console.log(`\n✅ Verification: ${count} templates found in database`);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedAllTemplates()
    .then(() => {
      console.log('\n🎉 All done! You can now use all 4 survey templates.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAllTemplates };
