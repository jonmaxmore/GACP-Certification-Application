/**
 * Predefined Cannabis Survey Templates
 * Ready-to-use cannabis survey templates for different purposes and regions
 */

const { CannabisSurveyTemplate, CannabisQuestion } = require('../models/CannabisSurvey');

// Template definitions with comprehensive cannabis-specific questions
const cannabisTemplates = [
  {
    // Pre-Cultivation Assessment Template
    template: {
      title: 'Cannabis Pre-Cultivation Assessment Survey',
      titleTH: 'แบบสำรวจการประเมินก่อนการเพาะปลูกกัญชา',
      description:
        'Comprehensive assessment before starting cannabis cultivation including license verification, site preparation, and compliance readiness',
      descriptionTH:
        'การประเมินครอบคลุมก่อนเริ่มการเพาะปลูกกัญชา รวมถึงการตรวจสอบใบอนุญาต การเตรียมพื้นที่ และความพร้อมในการปฏิบัติตาม',
      region: 'national',
      status: 'published',
      cannabisMetadata: {
        surveyType: 'pre_cultivation_assessment',
        cannabisCategory: 'medical_cannabis',
        licenseRequirements: {
          cultivationLicense: true,
          processingLicense: false,
          tradingLicense: false,
          researchLicense: false
        },
        thcLimitCompliance: {
          required: true,
          maxThcLevel: 0.2,
          testingRequired: true
        },
        gacpCompliance: {
          required: true,
          certificationLevel: 'standard',
          sopRequired: true
        },
        targetAudience: {
          farmers: true,
          processors: false,
          researchers: false,
          regulators: false,
          traders: false
        },
        cultivationStages: [
          { stage: 'planning', applicable: true, priority: 10 },
          { stage: 'soil_preparation', applicable: true, priority: 9 },
          { stage: 'planting', applicable: true, priority: 8 }
        ],
        qualityParameters: [
          {
            parameter: 'soil_ph',
            required: true,
            testingMethod: 'digital_ph_meter',
            acceptableRange: { min: 6.0, max: 7.5, unit: 'pH' }
          },
          {
            parameter: 'soil_nutrients',
            required: true,
            testingMethod: 'soil_analysis',
            acceptableRange: { min: 1.5, max: 3.0, unit: 'EC' }
          }
        ],
        regulatoryFocus: [
          { regulation: 'cannabis_act_2019', applicable: true, complianceLevel: 'mandatory' },
          { regulation: 'gacp_standards', applicable: true, complianceLevel: 'mandatory' },
          { regulation: 'fda_regulations', applicable: true, complianceLevel: 'mandatory' }
        ]
      },
      settings: {
        allowAnonymous: false,
        allowMultipleSubmissions: false,
        requireLocation: true,
        requireLicenseVerification: true,
        encryptSensitiveData: true,
        auditTrail: true
      },
      accessControl: {
        restrictedAccess: true,
        allowedRoles: ['farmer', 'reviewer', 'cannabis_specialist'],
        licenseVerificationRequired: true,
        securityClearance: 'restricted'
      }
    },
    questions: [
      {
        type: 'license_verification',
        text: 'Please provide your cannabis cultivation license details',
        textTH: 'กรุณาระบุรายละเอียดใบอนุญาตเพาะปลูกกัญชา',
        category: 'license_verification',
        cannabisProperties: {
          licenseRequired: true,
          complianceCritical: true,
          riskLevel: 'critical',
          regulatoryBasis: [
            {
              regulation: 'cannabis_act_2019',
              section: 'Section 15',
              requirement: 'Valid cultivation license required'
            }
          ]
        },
        validation: {
          required: true,
          customValidation: {
            rule: 'license_number_format',
            errorMessage: 'Invalid license number format',
            errorMessageTH: 'รูปแบบหมายเลขใบอนุญาตไม่ถูกต้อง'
          }
        },
        order: 1
      },
      {
        type: 'cultivation_area',
        text: 'What is the total area allocated for cannabis cultivation (in rai)?',
        textTH: 'พื้นที่รวมที่จัดสรรสำหรับการเพาะปลูกกัญชา (หน่วยไร่)?',
        category: 'general_information',
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'medium',
          qualityParameter: {
            parameter: 'cultivation_area',
            measurementMethod: 'land_survey',
            acceptableRange: { min: 0.1, max: 50, unit: 'rai' }
          }
        },
        validation: {
          required: true,
          minValue: 0.1,
          maxValue: 50
        },
        metadata: {
          helpText: 'Area must not exceed license limitations',
          helpTextTH: 'พื้นที่ต้องไม่เกินข้อจำกัดในใบอนุญาต'
        },
        order: 2
      },
      {
        type: 'single_choice',
        text: 'What type of cultivation method will you use?',
        textTH: 'คุณจะใช้วิธีการเพาะปลูกแบบใด?',
        category: 'cultivation_practices',
        options: [
          {
            value: 'outdoor',
            label: 'Outdoor cultivation',
            labelTH: 'การเพาะปลูกกลางแจ้ง',
            complianceScore: 70,
            riskImpact: 'neutral'
          },
          {
            value: 'indoor',
            label: 'Indoor cultivation',
            labelTH: 'การเพาะปลูกในอาคาร',
            complianceScore: 90,
            riskImpact: 'positive'
          },
          {
            value: 'greenhouse',
            label: 'Greenhouse cultivation',
            labelTH: 'การเพาะปลูกในโรงเรือน',
            complianceScore: 85,
            riskImpact: 'positive'
          },
          {
            value: 'mixed',
            label: 'Mixed method',
            labelTH: 'วิธีผสม',
            complianceScore: 75,
            riskImpact: 'neutral'
          }
        ],
        cannabisProperties: {
          riskLevel: 'medium',
          sopLinked: {
            sopCode: 'GACP-CULT-001',
            relevance: 'direct'
          }
        },
        validation: {
          required: true
        },
        order: 3
      },
      {
        type: 'multi_choice',
        text: 'Which security measures will be implemented at your cultivation site?',
        textTH: 'มาตรการรักษาความปลอดภัยใดที่จะจัดให้มีที่แหล่งเพาะปลูก?',
        category: 'compliance_verification',
        options: [
          {
            value: 'cctv_24_7',
            label: '24/7 CCTV surveillance',
            labelTH: 'กล้องวงจรปิดตลอด 24 ชั่วโมง',
            complianceScore: 100,
            riskImpact: 'positive'
          },
          {
            value: 'access_control',
            label: 'Access control system',
            labelTH: 'ระบบควบคุมการเข้าถึง',
            complianceScore: 95,
            riskImpact: 'positive'
          },
          {
            value: 'perimeter_fence',
            label: 'Perimeter fencing',
            labelTH: 'รั้วรอบพื้นที่',
            complianceScore: 80,
            riskImpact: 'positive'
          },
          {
            value: 'security_guard',
            label: 'Security personnel',
            labelTH: 'เจ้าหน้าที่รักษาความปลอดภัย',
            complianceScore: 85,
            riskImpact: 'positive'
          },
          {
            value: 'alarm_system',
            label: 'Alarm system',
            labelTH: 'ระบบสัญญาณเตือน',
            complianceScore: 75,
            riskImpact: 'positive'
          }
        ],
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'high',
          regulatoryBasis: [
            {
              regulation: 'cannabis_act_2019',
              section: 'Section 22',
              requirement: 'Adequate security measures required'
            }
          ]
        },
        validation: {
          required: true
        },
        metadata: {
          helpText: 'Select all applicable security measures',
          helpTextTH: 'เลือกมาตรการรักษาความปลอดภัยที่เกี่ยวข้องทั้งหมด'
        },
        order: 4
      },
      {
        type: 'boolean',
        text: 'Do you have a water source testing certificate showing water quality meets cannabis cultivation standards?',
        textTH:
          'คุณมีใบรับรองการทดสอบแหล่งน้ำที่แสดงคุณภาพน้ำเป็นไปตามมาตรฐานการเพาะปลูกกัญชาหรือไม่?',
        category: 'quality_testing',
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'high',
          sopLinked: {
            sopCode: 'GACP-WATER-001',
            relevance: 'direct'
          }
        },
        validation: {
          required: true
        },
        metadata: {
          helpText: 'Water quality testing is mandatory before cultivation',
          helpTextTH: 'การทดสอบคุณภาพน้ำเป็นข้อบังคับก่อนการเพาะปลูก'
        },
        order: 5
      },
      {
        type: 'text',
        text: 'Please specify the cannabis strains you plan to cultivate (including THC/CBD ratios if known)',
        textTH: 'กรุณาระบุพันธุ์กัญชาที่คุณวางแผนจะเพาะปลูก (รวมอัตราส่วน THC/CBD หากทราบ)',
        category: 'strain_information',
        cannabisProperties: {
          thcRelevant: true,
          riskLevel: 'medium',
          qualityParameter: {
            parameter: 'strain_specification',
            measurementMethod: 'genetic_analysis'
          }
        },
        validation: {
          required: true,
          maxLength: 500
        },
        metadata: {
          placeholderText:
            'e.g., CBD strain with <0.2% THC, Medical strain with 1:20 THC:CBD ratio',
          placeholderTextTH:
            'เช่น พันธุ์ CBD ที่มี THC น้อยกว่า 0.2%, พันธุ์การแพทย์ที่มีอัตราส่วน THC:CBD เป็น 1:20'
        },
        order: 6
      },
      {
        type: 'rating_scale',
        text: 'Rate your current knowledge of GACP (Good Agricultural and Collection Practices) standards for cannabis',
        textTH: 'ประเมินความรู้ปัจจุบันของคุณเกี่ยวกับมาตรฐาน GACP สำหรับกัญชา',
        category: 'training_needs',
        options: [
          { value: '1', label: 'No knowledge', labelTH: 'ไม่มีความรู้', complianceScore: 20 },
          {
            value: '2',
            label: 'Basic knowledge',
            labelTH: 'ความรู้ขั้นพื้นฐาน',
            complianceScore: 40
          },
          {
            value: '3',
            label: 'Moderate knowledge',
            labelTH: 'ความรู้ปานกลาง',
            complianceScore: 60
          },
          { value: '4', label: 'Good knowledge', labelTH: 'ความรู้ดี', complianceScore: 80 },
          {
            value: '5',
            label: 'Expert knowledge',
            labelTH: 'ความรู้ระดับผู้เชี่ยวชาญ',
            complianceScore: 100
          }
        ],
        cannabisProperties: {
          riskLevel: 'medium',
          sopLinked: {
            sopCode: 'GACP-TRAIN-001',
            relevance: 'indirect'
          }
        },
        validation: {
          required: true
        },
        order: 7
      },
      {
        type: 'boolean',
        text: 'Have you completed the mandatory cannabis cultivation training program required by law?',
        textTH: 'คุณได้เสร็จสิ้นหลักสูตรการฝึกอบรมการเพาะปลูกกัญชาที่กฎหมายกำหนดแล้วหรือไม่?',
        category: 'regulatory_awareness',
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'critical',
          regulatoryBasis: [
            {
              regulation: 'cannabis_act_2019',
              section: 'Section 18',
              requirement: 'Mandatory training completion'
            }
          ]
        },
        validation: {
          required: true
        },
        order: 8
      },
      {
        type: 'single_choice',
        text: 'What is your planned irrigation system?',
        textTH: 'ระบบการให้น้ำที่คุณวางแผนจะใช้คืออะไร?',
        category: 'cultivation_practices',
        options: [
          {
            value: 'drip_irrigation',
            label: 'Drip irrigation system',
            labelTH: 'ระบบน้ำหยด',
            complianceScore: 90,
            riskImpact: 'positive'
          },
          {
            value: 'sprinkler',
            label: 'Sprinkler system',
            labelTH: 'ระบบสปริงเกอร์',
            complianceScore: 75,
            riskImpact: 'neutral'
          },
          {
            value: 'flood_irrigation',
            label: 'Flood irrigation',
            labelTH: 'การให้น้ำแบบท่วม',
            complianceScore: 50,
            riskImpact: 'negative'
          },
          {
            value: 'manual_watering',
            label: 'Manual watering',
            labelTH: 'การให้น้ำด้วยมือ',
            complianceScore: 60,
            riskImpact: 'neutral'
          }
        ],
        cannabisProperties: {
          riskLevel: 'medium',
          sopLinked: {
            sopCode: 'GACP-IRRIG-001',
            relevance: 'direct'
          }
        },
        validation: {
          required: true
        },
        order: 9
      },
      {
        type: 'compliance_checklist',
        text: 'Pre-cultivation compliance checklist - Please confirm you have completed the following:',
        textTH:
          'รายการตรวจสอบการปฏิบัติตามก่อนการเพาะปลูก - กรุณายืนยันว่าคุณได้ดำเนินการต่อไปนี้แล้ว:',
        category: 'compliance_verification',
        options: [
          {
            value: 'license_obtained',
            label: 'Valid cultivation license obtained',
            labelTH: 'ได้รับใบอนุญาตเพาะปลูกที่ถูกต้อง',
            complianceScore: 100,
            riskImpact: 'positive'
          },
          {
            value: 'site_inspection',
            label: 'Site inspection by authorities completed',
            labelTH: 'การตรวจสถานที่โดยหน่วยงานที่เกี่ยวข้องเสร็จสิ้นแล้ว',
            complianceScore: 100,
            riskImpact: 'positive'
          },
          {
            value: 'security_approved',
            label: 'Security measures approved by authorities',
            labelTH: 'มาตรการรักษาความปลอดภัยได้รับการอนุมัติจากหน่วยงาน',
            complianceScore: 100,
            riskImpact: 'positive'
          },
          {
            value: 'sop_prepared',
            label: 'Standard Operating Procedures (SOPs) prepared',
            labelTH: 'เตรียมขั้นตอนการปฏิบัติงานมาตรฐาน (SOPs) แล้ว',
            complianceScore: 95,
            riskImpact: 'positive'
          },
          {
            value: 'records_system',
            label: 'Record keeping system established',
            labelTH: 'จัดระบบการบันทึกข้อมูลแล้ว',
            complianceScore: 90,
            riskImpact: 'positive'
          }
        ],
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'critical'
        },
        validation: {
          required: true
        },
        metadata: {
          helpText: 'All items must be completed before cultivation can begin',
          helpTextTH: 'รายการทั้งหมดต้องเสร็จสิ้นก่อนที่จะเริ่มการเพาะปลูกได้'
        },
        order: 10
      }
    ]
  },

  {
    // Cultivation Practices Monitoring Template
    template: {
      title: 'Cannabis Cultivation Practices Monitoring Survey',
      titleTH: 'แบบสำรวจการติดตามการปฏิบัติการเพาะปลูกกัญชา',
      description:
        'Regular monitoring survey for ongoing cannabis cultivation practices, GACP compliance, and quality management',
      descriptionTH:
        'แบบสำรวจการติดตามประจำสำหรับการปฏิบัติการเพาะปลูกกัญชาที่ดำเนินอยู่ การปฏิบัติตาม GACP และการจัดการคุณภาพ',
      region: 'national',
      status: 'published',
      cannabisMetadata: {
        surveyType: 'cultivation_practices',
        cannabisCategory: 'medical_cannabis',
        licenseRequirements: {
          cultivationLicense: true,
          processingLicense: false,
          tradingLicense: false,
          researchLicense: false
        },
        cultivationStages: [
          { stage: 'vegetative_growth', applicable: true, priority: 10 },
          { stage: 'flowering', applicable: true, priority: 10 },
          { stage: 'harvesting', applicable: true, priority: 9 }
        ]
      },
      settings: {
        allowAnonymous: false,
        allowMultipleSubmissions: true,
        requireLocation: true,
        requireLicenseVerification: true
      }
    },
    questions: [
      {
        type: 'date',
        text: 'What is the current cultivation cycle start date?',
        textTH: 'วันที่เริ่มต้นรอบการเพาะปลูกปัจจุบันคือเมื่อใด?',
        category: 'general_information',
        validation: { required: true },
        order: 1
      },
      {
        type: 'single_choice',
        text: 'What is the current growth stage of your cannabis plants?',
        textTH: 'ระยะการเจริญเติบโตปัจจุบันของต้นกัญชาของคุณคือระยะใด?',
        category: 'cultivation_practices',
        options: [
          { value: 'seedling', label: 'Seedling', labelTH: 'ระยะต้นกล้า', complianceScore: 80 },
          {
            value: 'vegetative',
            label: 'Vegetative',
            labelTH: 'ระยะเจริญเติบโตทางใบ',
            complianceScore: 85
          },
          { value: 'flowering', label: 'Flowering', labelTH: 'ระยะออกดอก', complianceScore: 90 },
          {
            value: 'harvest_ready',
            label: 'Harvest ready',
            labelTH: 'พร้อมเก็บเกี่ยว',
            complianceScore: 95
          }
        ],
        validation: { required: true },
        order: 2
      },
      {
        type: 'number',
        text: 'How many cannabis plants are currently being cultivated?',
        textTH: 'ปัจจุบันมีต้นกัญชากี่ต้นที่กำลังเพาะปลูกอยู่?',
        category: 'cultivation_practices',
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'high'
        },
        validation: {
          required: true,
          minValue: 1,
          maxValue: 1000
        },
        order: 3
      },
      {
        type: 'multi_choice',
        text: 'Which pest management practices are you currently using?',
        textTH: 'การปฏิบัติการจัดการศัตรูพืชใดที่คุณใช้อยู่ในปัจจุบัน?',
        category: 'pest_management',
        options: [
          {
            value: 'organic_pesticides',
            label: 'Organic pesticides',
            labelTH: 'สารกำจัดศัตรูพืชอินทรีย์',
            complianceScore: 90
          },
          {
            value: 'biological_control',
            label: 'Biological control',
            labelTH: 'การควบคุมทางชีววิทยา',
            complianceScore: 95
          },
          {
            value: 'integrated_pest_management',
            label: 'Integrated Pest Management (IPM)',
            labelTH: 'การจัดการศัตรูพืชแบบบูรณาการ',
            complianceScore: 100
          },
          {
            value: 'chemical_pesticides',
            label: 'Chemical pesticides (approved only)',
            labelTH: 'สารเคมีกำจัดศัตรูพืช (ที่อนุมัติเท่านั้น)',
            complianceScore: 70
          },
          {
            value: 'none',
            label: 'No pest management',
            labelTH: 'ไม่มีการจัดการศัตรูพืช',
            complianceScore: 30
          }
        ],
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'high'
        },
        validation: { required: true },
        order: 4
      },
      {
        type: 'thc_measurement',
        text: 'Latest THC content measurement (%)',
        textTH: 'การวัดปริมาณ THC ล่าสุด (%)',
        category: 'quality_testing',
        cannabisProperties: {
          thcRelevant: true,
          complianceCritical: true,
          riskLevel: 'critical',
          qualityParameter: {
            parameter: 'thc_content',
            measurementMethod: 'laboratory_analysis',
            acceptableRange: { min: 0, max: 0.2, unit: '%' }
          }
        },
        validation: {
          required: true,
          minValue: 0,
          maxValue: 30
        },
        metadata: {
          helpText: 'THC content must not exceed 0.2% for industrial hemp',
          helpTextTH: 'ปริมาณ THC ต้องไม่เกิน 0.2% สำหรับกัญชงอุตสาหกรรม'
        },
        order: 5
      }
    ]
  },

  {
    // Harvest and Processing Template
    template: {
      title: 'Cannabis Harvest and Processing Assessment Survey',
      titleTH: 'แบบสำรวจการประเมินการเก็บเกี่ยวและแปรรูปกัญชา',
      description:
        'Post-harvest assessment covering harvesting practices, processing methods, quality control, and compliance with regulations',
      descriptionTH:
        'การประเมินหลังการเก็บเกี่ยวครอบคลุมการปฏิบัติการเก็บเกี่ยว วิธีการแปรรูป การควบคุมคุณภาพ และการปฏิบัติตามกฎระเบียบ',
      region: 'national',
      status: 'published',
      cannabisMetadata: {
        surveyType: 'harvest_processing',
        cannabisCategory: 'medical_cannabis',
        licenseRequirements: {
          cultivationLicense: true,
          processingLicense: true,
          tradingLicense: false,
          researchLicense: false
        },
        cultivationStages: [
          { stage: 'harvesting', applicable: true, priority: 10 },
          { stage: 'drying_curing', applicable: true, priority: 10 },
          { stage: 'processing', applicable: true, priority: 9 },
          { stage: 'packaging', applicable: true, priority: 8 }
        ]
      }
    },
    questions: [
      {
        type: 'date',
        text: 'What was the harvest date?',
        textTH: 'วันที่เก็บเกี่ยวคือเมื่อใด?',
        category: 'harvest_timing',
        validation: { required: true },
        order: 1
      },
      {
        type: 'number',
        text: 'Total yield harvested (kg)',
        textTH: 'ผลผลิตรวมที่เก็บเกี่ยวได้ (กิโลกรัม)',
        category: 'harvest_timing',
        cannabisProperties: {
          complianceCritical: true,
          qualityParameter: {
            parameter: 'total_yield',
            measurementMethod: 'precision_scale',
            acceptableRange: { min: 0.1, max: 10000, unit: 'kg' }
          }
        },
        validation: {
          required: true,
          minValue: 0.1
        },
        order: 2
      },
      {
        type: 'single_choice',
        text: 'Which drying method was used?',
        textTH: 'ใช้วิธีการอบแห้งแบบใด?',
        category: 'post_harvest_handling',
        options: [
          {
            value: 'air_drying',
            label: 'Air drying',
            labelTH: 'การอบแห้งด้วยอากาศ',
            complianceScore: 85
          },
          {
            value: 'controlled_environment',
            label: 'Controlled environment drying',
            labelTH: 'การอบแห้งในสภาพแวดล้อมควบคุม',
            complianceScore: 95
          },
          {
            value: 'freeze_drying',
            label: 'Freeze drying',
            labelTH: 'การอบแห้งแบบแช่แข็ง',
            complianceScore: 90
          },
          {
            value: 'heat_drying',
            label: 'Heat drying',
            labelTH: 'การอบแห้งด้วยความร้อน',
            complianceScore: 70
          }
        ],
        cannabisProperties: {
          riskLevel: 'medium',
          sopLinked: {
            sopCode: 'GACP-DRY-001',
            relevance: 'direct'
          }
        },
        validation: { required: true },
        order: 3
      },
      {
        type: 'boolean',
        text: 'Was laboratory testing conducted on the harvested cannabis?',
        textTH: 'มีการทดสอบทางห้องปฏิบัติการกับกัญชาที่เก็บเกี่ยวแล้วหรือไม่?',
        category: 'quality_testing',
        cannabisProperties: {
          complianceCritical: true,
          riskLevel: 'critical'
        },
        validation: { required: true },
        order: 4
      },
      {
        type: 'number',
        text: 'Final THC content after processing (%)',
        textTH: 'ปริมาณ THC สุดท้ายหลังการแปรรูป (%)',
        category: 'quality_testing',
        cannabisProperties: {
          thcRelevant: true,
          complianceCritical: true,
          riskLevel: 'critical'
        },
        validation: {
          required: true,
          minValue: 0,
          maxValue: 30
        },
        order: 5
      }
    ]
  }
];

// Function to create all templates and questions
async function createCannabisTemplates(createdBy = null) {
  try {
    const results = [];

    for (const templateData of cannabisTemplates) {
      // Create template
      const template = new CannabisSurveyTemplate({
        ...templateData.template,
        createdBy: createdBy || new mongoose.Types.ObjectId()
      });

      await template.save();

      // Create questions for this template
      const questions = templateData.questions.map((q, index) => ({
        ...q,
        templateId: template._id,
        order: q.order || index + 1
      }));

      const createdQuestions = await CannabisQuestion.insertMany(questions);

      results.push({
        template: template,
        questions: createdQuestions,
        questionCount: createdQuestions.length
      });

      console.log(
        `Created cannabis survey template: ${template.title} with ${createdQuestions.length} questions`
      );
    }

    return results;
  } catch (error) {
    console.error('Error creating cannabis templates:', error);
    throw error;
  }
}

// Function to create individual template
async function createIndividualTemplate(templateIndex, createdBy = null) {
  try {
    if (templateIndex < 0 || templateIndex >= cannabisTemplates.length) {
      throw new Error('Invalid template index');
    }

    const templateData = cannabisTemplates[templateIndex];

    const template = new CannabisSurveyTemplate({
      ...templateData.template,
      createdBy: createdBy || new mongoose.Types.ObjectId()
    });

    await template.save();

    const questions = templateData.questions.map((q, index) => ({
      ...q,
      templateId: template._id,
      order: q.order || index + 1
    }));

    const createdQuestions = await CannabisQuestion.insertMany(questions);

    return {
      template: template,
      questions: createdQuestions,
      questionCount: createdQuestions.length
    };
  } catch (error) {
    console.error('Error creating individual cannabis template:', error);
    throw error;
  }
}

// Function to get template by survey type
async function getTemplateByType(surveyType, region = 'national') {
  try {
    const template = await CannabisSurveyTemplate.findOne({
      'cannabisMetadata.surveyType': surveyType,
      region: { $in: [region, 'national'] },
      status: 'published'
    });

    if (!template) {
      return null;
    }

    const questions = await CannabisQuestion.find({
      templateId: template._id,
      isActive: true
    }).sort({ order: 1 });

    return {
      template,
      questions
    };
  } catch (error) {
    console.error('Error getting template by type:', error);
    throw error;
  }
}

// Function to update existing templates
async function updateTemplateQuestions(templateId, newQuestions) {
  try {
    // Deactivate existing questions
    await CannabisQuestion.updateMany({ templateId }, { isActive: false });

    // Create new questions
    const questions = newQuestions.map((q, index) => ({
      ...q,
      templateId,
      order: q.order || index + 1,
      isActive: true
    }));

    const createdQuestions = await CannabisQuestion.insertMany(questions);

    return createdQuestions;
  } catch (error) {
    console.error('Error updating template questions:', error);
    throw error;
  }
}

module.exports = {
  cannabisTemplates,
  createCannabisTemplates,
  createIndividualTemplate,
  getTemplateByType,
  updateTemplateQuestions
};
