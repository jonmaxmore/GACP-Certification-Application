// ======================================================================
// GACP Cannabis Farm Management - MongoDB Schema & Collections
// กรมแพทย์แผนไทยและการแพทย์ทางเลือก
// Database: gacp_production
// ======================================================================

// ======================================================================
// 1. CANNABIS FARMS COLLECTION
// ======================================================================

db.createCollection('cannabis_farms', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['farm_id', 'farm_name', 'license_number', 'owner_name', 'address', 'province'],
      properties: {
        farm_id: {
          bsonType: 'string',
          pattern: '^FARM-[0-9]{4}-[0-9]{3}$',
          description: 'Unique farm identifier'
        },
        farm_name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 255
        },
        license_number: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50
        },
        owner_name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 255
        },
        owner_id_card: {
          bsonType: 'string',
          pattern: '^[0-9]{13}$'
        },
        contact: {
          bsonType: 'object',
          properties: {
            phone: { bsonType: 'string' },
            email: { bsonType: 'string' }
          }
        },
        location: {
          bsonType: 'object',
          required: ['address', 'province'],
          properties: {
            address: { bsonType: 'string' },
            province: { bsonType: 'string' },
            district: { bsonType: 'string' },
            subdistrict: { bsonType: 'string' },
            postal_code: { bsonType: 'string' },
            gps: {
              bsonType: 'object',
              properties: {
                latitude: { bsonType: 'double' },
                longitude: { bsonType: 'double' }
              }
            }
          }
        },
        farm_details: {
          bsonType: 'object',
          properties: {
            total_area: { bsonType: 'double', minimum: 0 },
            cultivation_area: { bsonType: 'double', minimum: 0 },
            greenhouse_area: { bsonType: 'double', minimum: 0 },
            outdoor_area: { bsonType: 'double', minimum: 0 }
          }
        },
        gacp_status: {
          bsonType: 'string',
          enum: ['pending', 'under_review', 'certified', 'expired', 'suspended', 'revoked']
        },
        certification: {
          bsonType: 'object',
          properties: {
            date: { bsonType: 'date' },
            expiry_date: { bsonType: 'date' },
            inspector_id: { bsonType: 'string' },
            compliance_score: { bsonType: 'int', minimum: 0, maximum: 100 }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' },
        is_active: { bsonType: 'bool' }
      }
    }
  }
});

// Create indexes for cannabis_farms
db.cannabis_farms.createIndex({ license_number: 1 }, { unique: true });
db.cannabis_farms.createIndex({ gacp_status: 1 });
db.cannabis_farms.createIndex({ 'location.province': 1 });
db.cannabis_farms.createIndex({ 'certification.compliance_score': -1 });

// Sample farm document
const sampleFarm = {
  farm_id: 'FARM-2025-001',
  farm_name: 'สวนกัญชา ชัยภูมิ',
  license_number: 'CANNABIS-CP-2025-001',
  owner_name: 'สมชาย ใจดี',
  owner_id_card: '1234567890123',
  contact: {
    phone: '081-234-5678',
    email: 'somchai@farm.com'
  },
  location: {
    address: '123 หมู่ 5 ต.ในเมือง',
    province: 'ชัยภูมิ',
    district: 'เมืองชัยภูมิ',
    subdistrict: 'ในเมือง',
    postal_code: '36000',
    gps: {
      latitude: 15.8059,
      longitude: 102.0285
    }
  },
  farm_details: {
    total_area: 10.5,
    cultivation_area: 8.0,
    greenhouse_area: 5.0,
    outdoor_area: 3.0
  },
  gacp_status: 'certified',
  certification: {
    date: new Date('2025-01-15'),
    expiry_date: new Date('2026-01-15'),
    inspector_id: 'INSP-001',
    compliance_score: 92
  },
  created_at: new Date(),
  updated_at: new Date(),
  is_active: true
};

// ======================================================================
// 2. CULTIVATION CYCLES COLLECTION
// ======================================================================

db.createCollection('cultivation_cycles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['cycle_id', 'farm_id', 'variety_name', 'planned_start_date'],
      properties: {
        cycle_id: {
          bsonType: 'string',
          pattern: '^CYCLE-[0-9]{4}-[0-9]{3}$'
        },
        farm_id: { bsonType: 'string' },
        plot_name: { bsonType: 'string' },
        variety: {
          bsonType: 'object',
          required: ['name', 'type'],
          properties: {
            name: { bsonType: 'string' },
            type: {
              bsonType: 'string',
              enum: ['indica', 'sativa', 'hybrid']
            },
            seed_source: { bsonType: 'string' },
            certificate_number: { bsonType: 'string' },
            genetics_info: { bsonType: 'string' }
          }
        },
        timeline: {
          bsonType: 'object',
          properties: {
            planned_start_date: { bsonType: 'date' },
            actual_start_date: { bsonType: 'date' },
            planned_harvest_date: { bsonType: 'date' },
            actual_harvest_date: { bsonType: 'date' }
          }
        },
        plant_info: {
          bsonType: 'object',
          properties: {
            planned_count: { bsonType: 'int', minimum: 1 },
            actual_count: { bsonType: 'int', minimum: 0 },
            cultivation_area: { bsonType: 'double', minimum: 0 },
            method: {
              bsonType: 'string',
              enum: ['indoor', 'greenhouse', 'outdoor', 'hydroponic', 'soil']
            }
          }
        },
        status: {
          bsonType: 'string',
          enum: [
            'planned',
            'germination',
            'vegetative',
            'flowering',
            'harvesting',
            'drying',
            'cured',
            'completed',
            'failed'
          ]
        },
        current_phase: {
          bsonType: 'string',
          enum: ['pre_planting', 'planting', 'growing', 'flowering', 'harvesting', 'post_harvest']
        },
        production_results: {
          bsonType: 'object',
          properties: {
            total_yield_fresh: { bsonType: 'double', minimum: 0 },
            total_yield_dry: { bsonType: 'double', minimum: 0 },
            quality_grade: {
              bsonType: 'string',
              enum: ['Grade A', 'Grade B', 'Grade C', 'Below Standard']
            },
            thc_content: { bsonType: 'double', minimum: 0, maximum: 100 },
            cbd_content: { bsonType: 'double', minimum: 0, maximum: 100 }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.cultivation_cycles.createIndex({ farm_id: 1, status: 1 });
db.cultivation_cycles.createIndex({ 'timeline.planned_start_date': 1 });
db.cultivation_cycles.createIndex({ 'variety.name': 1, 'variety.type': 1 });

// ======================================================================
// 3. SOP ACTIVITIES COLLECTION
// ======================================================================

db.createCollection('sop_activities', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['activity_id', 'cycle_id', 'template_id', 'scheduled_date'],
      properties: {
        activity_id: {
          bsonType: 'string',
          pattern: '^ACT-[0-9]{4}-[0-9]{6}$'
        },
        cycle_id: { bsonType: 'string' },
        template_id: { bsonType: 'string' },
        scheduling: {
          bsonType: 'object',
          properties: {
            scheduled_date: { bsonType: 'date' },
            scheduled_time: { bsonType: 'string' },
            completed_date: { bsonType: 'date' },
            completed_time: { bsonType: 'string' }
          }
        },
        execution: {
          bsonType: 'object',
          properties: {
            status: {
              bsonType: 'string',
              enum: ['pending', 'in_progress', 'completed', 'skipped', 'failed']
            },
            performed_by: { bsonType: 'string' }
          }
        },
        measurements: {
          bsonType: 'object',
          properties: {
            temperature: { bsonType: 'double' },
            humidity: { bsonType: 'double' },
            ph: { bsonType: 'double' },
            ec: { bsonType: 'double' }
          }
        },
        compliance: {
          bsonType: 'object',
          properties: {
            status: {
              bsonType: 'string',
              enum: ['compliant', 'minor_deviation', 'major_deviation', 'non_compliant']
            },
            score: { bsonType: 'int', minimum: 0, maximum: 100 },
            deviation_reason: { bsonType: 'string' },
            corrective_action: { bsonType: 'string' }
          }
        },
        documentation: {
          bsonType: 'object',
          properties: {
            notes: { bsonType: 'string' },
            photos: { bsonType: 'array', items: { bsonType: 'string' } },
            documents: { bsonType: 'array', items: { bsonType: 'string' } }
          }
        },
        weather: {
          bsonType: 'object',
          properties: {
            conditions: { bsonType: 'string' },
            outdoor_temperature: { bsonType: 'double' },
            outdoor_humidity: { bsonType: 'double' }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.sop_activities.createIndex({ cycle_id: 1, 'execution.status': 1 });
db.sop_activities.createIndex({ 'scheduling.scheduled_date': 1 });
db.sop_activities.createIndex({ 'compliance.status': 1, 'compliance.score': -1 });

// ======================================================================
// 4. SOP ACTIVITY TEMPLATES COLLECTION
// ======================================================================

db.createCollection('sop_activity_templates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['template_id', 'phase', 'category', 'activity_name'],
      properties: {
        template_id: { bsonType: 'string' },
        phase: {
          bsonType: 'string',
          enum: ['pre_planting', 'planting', 'growing', 'flowering', 'harvesting', 'post_harvest']
        },
        category: {
          bsonType: 'string',
          enum: [
            'water_management',
            'nutrition',
            'environment',
            'pest_control',
            'quality_testing',
            'documentation',
            'harvesting',
            'processing'
          ]
        },
        activity_name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        requirements: {
          bsonType: 'object',
          properties: {
            is_mandatory: { bsonType: 'bool' },
            frequency: {
              bsonType: 'string',
              enum: ['daily', 'weekly', 'biweekly', 'monthly', 'phase_based', 'as_needed']
            },
            compliance_weight: { bsonType: 'int', minimum: 1, maximum: 10 }
          }
        },
        standards: {
          bsonType: 'object',
          properties: {
            temperature: {
              bsonType: 'object',
              properties: {
                min: { bsonType: 'double' },
                max: { bsonType: 'double' }
              }
            },
            humidity: {
              bsonType: 'object',
              properties: {
                min: { bsonType: 'double' },
                max: { bsonType: 'double' }
              }
            },
            ph: {
              bsonType: 'object',
              properties: {
                min: { bsonType: 'double' },
                max: { bsonType: 'double' }
              }
            },
            ec: {
              bsonType: 'object',
              properties: {
                min: { bsonType: 'double' },
                max: { bsonType: 'double' }
              }
            }
          }
        },
        documentation_requirements: {
          bsonType: 'object',
          properties: {
            photo_required: { bsonType: 'bool' },
            measurement_required: { bsonType: 'bool' },
            lab_test_required: { bsonType: 'bool' }
          }
        },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.sop_activity_templates.createIndex({ phase: 1, category: 1 });

// ======================================================================
// 5. QUALITY TESTS COLLECTION
// ======================================================================

db.createCollection('quality_tests', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['test_id', 'cycle_id', 'test_type', 'test_date'],
      properties: {
        test_id: {
          bsonType: 'string',
          pattern: '^TEST-[0-9]{4}-[0-9]{4}$'
        },
        cycle_id: { bsonType: 'string' },
        test_type: {
          bsonType: 'string',
          enum: [
            'soil',
            'water',
            'plant_tissue',
            'product',
            'environmental',
            'residue',
            'microbiology',
            'potency'
          ]
        },
        test_details: {
          bsonType: 'object',
          properties: {
            test_date: { bsonType: 'date' },
            laboratory_name: { bsonType: 'string' },
            laboratory_license: { bsonType: 'string' },
            sample_collection_date: { bsonType: 'date' },
            sample_id: { bsonType: 'string' }
          }
        },
        test_parameters: {
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        test_results: {
          bsonType: 'object'
        },
        compliance: {
          bsonType: 'object',
          properties: {
            status: {
              bsonType: 'string',
              enum: ['passed', 'failed', 'conditional', 'pending']
            },
            gacp_standards_met: { bsonType: 'bool' }
          }
        },
        certification: {
          bsonType: 'object',
          properties: {
            certificate_number: { bsonType: 'string' },
            issue_date: { bsonType: 'date' },
            expiry_date: { bsonType: 'date' },
            file_path: { bsonType: 'string' }
          }
        },
        cannabis_specific: {
          bsonType: 'object',
          properties: {
            thc_percentage: { bsonType: 'double', minimum: 0, maximum: 100 },
            cbd_percentage: { bsonType: 'double', minimum: 0, maximum: 100 },
            moisture_content: { bsonType: 'double', minimum: 0, maximum: 100 }
          }
        },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.quality_tests.createIndex({ cycle_id: 1, test_type: 1 });
db.quality_tests.createIndex({ 'test_details.test_date': -1 });
db.quality_tests.createIndex({ 'compliance.status': 1 });

// ======================================================================
// 6. HARVEST RECORDS COLLECTION
// ======================================================================

db.createCollection('harvest_records', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['harvest_id', 'cycle_id', 'harvest_date', 'plants_harvested'],
      properties: {
        harvest_id: {
          bsonType: 'string',
          pattern: '^HARV-[0-9]{4}-[0-9]{4}$'
        },
        cycle_id: { bsonType: 'string' },
        harvest_details: {
          bsonType: 'object',
          properties: {
            harvest_date: { bsonType: 'date' },
            harvest_time: { bsonType: 'string' },
            harvested_by: { bsonType: 'string' }
          }
        },
        plant_info: {
          bsonType: 'object',
          properties: {
            plants_harvested: { bsonType: 'int', minimum: 1 },
            method: {
              bsonType: 'string',
              enum: ['whole_plant', 'selective', 'wet_trim', 'dry_trim']
            }
          }
        },
        weight_records: {
          bsonType: 'object',
          properties: {
            fresh_weight: { bsonType: 'double', minimum: 0 },
            estimated_dry_weight: { bsonType: 'double', minimum: 0 },
            actual_dry_weight: { bsonType: 'double', minimum: 0 }
          }
        },
        quality_assessment: {
          bsonType: 'object',
          properties: {
            visual_quality: {
              bsonType: 'string',
              enum: ['excellent', 'good', 'fair', 'poor']
            },
            trichome_development: {
              bsonType: 'string',
              enum: ['clear', 'cloudy', 'amber', 'mixed']
            },
            aroma_profile: { bsonType: 'string' }
          }
        },
        environmental_conditions: {
          bsonType: 'object',
          properties: {
            temperature: { bsonType: 'double' },
            humidity: { bsonType: 'double' }
          }
        },
        storage: {
          bsonType: 'object',
          properties: {
            location: { bsonType: 'string' },
            conditions: { bsonType: 'string' }
          }
        },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.harvest_records.createIndex({ cycle_id: 1, 'harvest_details.harvest_date': -1 });

// ======================================================================
// 7. COMPLIANCE ASSESSMENTS COLLECTION
// ======================================================================

db.createCollection('compliance_assessments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['assessment_id', 'farm_id', 'assessment_date', 'assessor_name'],
      properties: {
        assessment_id: {
          bsonType: 'string',
          pattern: '^COMP-[0-9]{4}-[0-9]{4}$'
        },
        farm_id: { bsonType: 'string' },
        cycle_id: { bsonType: 'string' },
        assessment_details: {
          bsonType: 'object',
          properties: {
            assessment_date: { bsonType: 'date' },
            type: {
              bsonType: 'string',
              enum: ['initial', 'periodic', 'follow_up', 'complaint_based', 'random']
            },
            assessor_name: { bsonType: 'string' },
            assessor_license: { bsonType: 'string' }
          }
        },
        compliance_scores: {
          bsonType: 'object',
          properties: {
            facility: { bsonType: 'int', minimum: 0, maximum: 100 },
            sop: { bsonType: 'int', minimum: 0, maximum: 100 },
            documentation: { bsonType: 'int', minimum: 0, maximum: 100 },
            quality_control: { bsonType: 'int', minimum: 0, maximum: 100 },
            traceability: { bsonType: 'int', minimum: 0, maximum: 100 },
            overall: { bsonType: 'int', minimum: 0, maximum: 100 }
          }
        },
        compliance_level: {
          bsonType: 'string',
          enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'non_compliant']
        },
        violations: {
          bsonType: 'object',
          properties: {
            total: { bsonType: 'int', minimum: 0 },
            critical: { bsonType: 'int', minimum: 0 },
            major: { bsonType: 'int', minimum: 0 },
            minor: { bsonType: 'int', minimum: 0 }
          }
        },
        recommendations: { bsonType: 'string' },
        corrective_actions_required: { bsonType: 'string' },
        follow_up: {
          bsonType: 'object',
          properties: {
            required: { bsonType: 'bool' },
            date: { bsonType: 'date' }
          }
        },
        certification_decision: {
          bsonType: 'object',
          properties: {
            decision: {
              bsonType: 'string',
              enum: ['approved', 'conditional', 'denied', 'suspended', 'revoked']
            },
            reason: { bsonType: 'string' }
          }
        },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.compliance_assessments.createIndex({ farm_id: 1, 'assessment_details.assessment_date': -1 });
db.compliance_assessments.createIndex({ compliance_level: 1 });

// ======================================================================
// 8. USERS COLLECTION
// ======================================================================

db.createCollection('cannabis_users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'username', 'email', 'role'],
      properties: {
        user_id: {
          bsonType: 'string',
          pattern: '^USER-[0-9]{4}$'
        },
        username: { bsonType: 'string', minLength: 3, maxLength: 100 },
        email: { bsonType: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
        password_hash: { bsonType: 'string' },
        personal_info: {
          bsonType: 'object',
          properties: {
            first_name: { bsonType: 'string' },
            last_name: { bsonType: 'string' },
            id_card_number: { bsonType: 'string', pattern: '^[0-9]{13}$' },
            phone_number: { bsonType: 'string' }
          }
        },
        role_permissions: {
          bsonType: 'object',
          properties: {
            role: {
              bsonType: 'string',
              enum: ['farmer', 'inspector', 'admin', 'lab_technician', 'auditor']
            },
            department: { bsonType: 'string' },
            license_number: { bsonType: 'string' },
            authority_level: { bsonType: 'int', minimum: 1, maximum: 5 }
          }
        },
        farm_id: { bsonType: 'string' },
        account_status: {
          bsonType: 'object',
          properties: {
            is_active: { bsonType: 'bool' },
            email_verified: { bsonType: 'bool' },
            last_login: { bsonType: 'date' }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.cannabis_users.createIndex({ username: 1 }, { unique: true });
db.cannabis_users.createIndex({ email: 1 }, { unique: true });
db.cannabis_users.createIndex({ 'role_permissions.role': 1, 'account_status.is_active': 1 });

// ======================================================================
// 9. AUDIT TRAIL COLLECTION
// ======================================================================

db.createCollection('audit_trail', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['audit_id', 'collection_name', 'record_id', 'action', 'user_id'],
      properties: {
        audit_id: {
          bsonType: 'string',
          pattern: '^AUDIT-[0-9]{4}-[0-9]{6}$'
        },
        collection_name: { bsonType: 'string' },
        record_id: { bsonType: 'string' },
        action: {
          bsonType: 'string',
          enum: ['create', 'update', 'delete', 'view', 'export', 'approve', 'reject']
        },
        user_info: {
          bsonType: 'object',
          properties: {
            user_id: { bsonType: 'string' },
            role: { bsonType: 'string' },
            ip: { bsonType: 'string' },
            user_agent: { bsonType: 'string' }
          }
        },
        changes: {
          bsonType: 'object',
          properties: {
            old_values: { bsonType: 'object' },
            new_values: { bsonType: 'object' },
            summary: { bsonType: 'string' }
          }
        },
        context: {
          bsonType: 'object',
          properties: {
            reason: { bsonType: 'string' },
            session_id: { bsonType: 'string' },
            endpoint: { bsonType: 'string' }
          }
        },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});

db.audit_trail.createIndex({ collection_name: 1, record_id: 1 });
db.audit_trail.createIndex({ 'user_info.user_id': 1, action: 1, timestamp: -1 });
db.audit_trail.createIndex({ timestamp: -1 });

// ======================================================================
// 10. SYSTEM NOTIFICATIONS COLLECTION
// ======================================================================

db.createCollection('system_notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['notification_id', 'type', 'title', 'message'],
      properties: {
        notification_id: {
          bsonType: 'string',
          pattern: '^NOTIF-[0-9]{6}$'
        },
        recipient: {
          bsonType: 'object',
          properties: {
            user_id: { bsonType: 'string' },
            role: { bsonType: 'string' }
          }
        },
        content: {
          bsonType: 'object',
          properties: {
            type: {
              bsonType: 'string',
              enum: [
                'sop_reminder',
                'compliance_alert',
                'test_due',
                'certification_expiry',
                'violation_found',
                'system_update'
              ]
            },
            title: { bsonType: 'string' },
            message: { bsonType: 'string' },
            severity: {
              bsonType: 'string',
              enum: ['info', 'warning', 'error', 'critical']
            }
          }
        },
        related_record: {
          bsonType: 'object',
          properties: {
            collection: { bsonType: 'string' },
            record_id: { bsonType: 'string' }
          }
        },
        status: {
          bsonType: 'object',
          properties: {
            current: {
              bsonType: 'string',
              enum: ['pending', 'sent', 'read', 'dismissed']
            },
            sent_at: { bsonType: 'date' },
            read_at: { bsonType: 'date' }
          }
        },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.system_notifications.createIndex({ 'recipient.user_id': 1, 'status.current': 1 });
db.system_notifications.createIndex({ 'content.type': 1, 'content.severity': 1 });

// ======================================================================
// INITIAL DATA INSERTION
// ======================================================================

// Insert SOP Activity Templates
db.sop_activity_templates.insertMany([
  {
    template_id: 'SOP-PP-001',
    phase: 'pre_planting',
    category: 'quality_testing',
    activity_name: 'ทดสอบคุณภาพดิน',
    description: 'ทดสอบ pH, EC, NPK และสารอินทรีย์ในดิน',
    requirements: {
      is_mandatory: true,
      frequency: 'phase_based',
      compliance_weight: 8
    },
    documentation_requirements: {
      photo_required: true,
      measurement_required: true,
      lab_test_required: false
    },
    created_at: new Date()
  },
  {
    template_id: 'SOP-PP-002',
    phase: 'pre_planting',
    category: 'quality_testing',
    activity_name: 'ทดสอบคุณภาพน้ำ',
    description: 'ทดสอบ pH, EC, โลหะหนัก และแบคทีเรียในน้ำ',
    requirements: {
      is_mandatory: true,
      frequency: 'phase_based',
      compliance_weight: 8
    },
    documentation_requirements: {
      photo_required: true,
      measurement_required: true,
      lab_test_required: true
    },
    created_at: new Date()
  },
  {
    template_id: 'SOP-GR-001',
    phase: 'growing',
    category: 'water_management',
    activity_name: 'การจัดการน้ำ',
    description: 'ตรวจสอบความชื้นดิน pH และ EC ของน้ำ',
    requirements: {
      is_mandatory: true,
      frequency: 'daily',
      compliance_weight: 7
    },
    standards: {
      ph: { min: 6.0, max: 7.5 },
      ec: { min: 0.8, max: 2.5 }
    },
    documentation_requirements: {
      photo_required: false,
      measurement_required: true,
      lab_test_required: false
    },
    created_at: new Date()
  },
  {
    template_id: 'SOP-GR-002',
    phase: 'growing',
    category: 'nutrition',
    activity_name: 'การให้สารอาหาร',
    description: 'ให้ปุ๋ยตามสูตรและบันทึกปริมาณ',
    requirements: {
      is_mandatory: true,
      frequency: 'weekly',
      compliance_weight: 6
    },
    documentation_requirements: {
      photo_required: false,
      measurement_required: true,
      lab_test_required: false
    },
    created_at: new Date()
  },
  {
    template_id: 'SOP-GR-003',
    phase: 'growing',
    category: 'environment',
    activity_name: 'ควบคุมสิ่งแวดล้อม',
    description: 'ติดตามอุณหภูมิ ความชื้น และการระบายอากาศ',
    requirements: {
      is_mandatory: true,
      frequency: 'daily',
      compliance_weight: 7
    },
    standards: {
      temperature: { min: 20, max: 28 },
      humidity: { min: 40, max: 60 }
    },
    documentation_requirements: {
      photo_required: false,
      measurement_required: true,
      lab_test_required: false
    },
    created_at: new Date()
  }
]);

// Insert sample farm
db.cannabis_farms.insertOne(sampleFarm);

// ======================================================================
// UTILITY FUNCTIONS
// ======================================================================

// Function to calculate farm compliance score
function calculateFarmComplianceScore(farmId) {
  const pipeline = [
    {
      $match: { farm_id: farmId }
    },
    {
      $lookup: {
        from: 'cultivation_cycles',
        localField: 'farm_id',
        foreignField: 'farm_id',
        as: 'cycles'
      }
    },
    {
      $lookup: {
        from: 'sop_activities',
        localField: 'cycles.cycle_id',
        foreignField: 'cycle_id',
        as: 'activities'
      }
    },
    {
      $lookup: {
        from: 'compliance_assessments',
        localField: 'farm_id',
        foreignField: 'farm_id',
        as: 'assessments'
      }
    },
    {
      $project: {
        farm_id: 1,
        farm_name: 1,
        sop_compliance: {
          $avg: '$activities.compliance.score'
        },
        latest_assessment: {
          $arrayElemAt: [
            {
              $sortArray: {
                input: '$assessments',
                sortBy: { 'assessment_details.assessment_date': -1 }
              }
            },
            0
          ]
        }
      }
    }
  ];

  return db.cannabis_farms.aggregate(pipeline);
}

// Function to get farm summary statistics
function getFarmSummaryStats() {
  return db.cannabis_farms.aggregate([
    {
      $group: {
        _id: '$gacp_status',
        count: { $sum: 1 },
        avg_compliance: { $avg: '$certification.compliance_score' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
}

// Function to get overdue SOP activities
function getOverdueSOPActivities() {
  return db.sop_activities
    .find({
      'execution.status': { $in: ['pending', 'in_progress'] },
      'scheduling.scheduled_date': { $lt: new Date() }
    })
    .sort({ 'scheduling.scheduled_date': 1 });
}

console.log('GACP Cannabis MongoDB Schema created successfully!');
console.log('Database: gacp_production');
console.log('Collections: 10 main collections with validation schemas');
console.log('Indexes: Optimized for query performance');
console.log('Sample data: Inserted for testing');
