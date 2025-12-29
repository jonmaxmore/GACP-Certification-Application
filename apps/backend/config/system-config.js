/**
 * System Configuration
 * Centralized constants for application logic to avoid magic numbers/strings
 */
module.exports = {
    FEES: {
        PHASE1_APPLICATION: 5000,
        PHASE2_INSPECTION: 30000,
        CURRENCY: 'THB',
        PAYMENT_DUE_DAYS: 7,
    },
    SCORING: {
        THRESHOLDS: {
            PASSING_SCORE: 70, // Assuming a passing score threshold
        },
        WEIGHTS: {
            DOCUMENT: 0.3,
            FARM_INFO: 0.3,
            PRACTICE: 0.4,
        },
        RISK_ADJUSTMENTS: {
            LOW: 0,
            MEDIUM: -5,
            HIGH: -10,
            CRITICAL: -20,
        },
        FARM_INFO_POINTS: {
            LOCATION: 25,
            OWNERSHIP: 25,
            WATER: 25,
            SOIL: 25,
        },
        COMPLIANCE: {
            MAX_CATEGORY_SCORE: 15,
            CATEGORIES: [
                'seed_planting_material',
                'soil_management',
                'pest_disease_management',
                'harvesting_practices',
                'post_harvest_handling',
                'storage_transportation',
                'record_keeping',
                'worker_training',
            ],
        },
    },
    SCHEDULING: {
        NOTICE_PERIOD_DAYS: 14,
        ESTIMATION: {
            BASE_HOURS: 4,
            HOURS_PER_5_AREA_UNIT: 1, // 1 hour per 5 units of area
            HOURS_PER_CROP: 1,
        },
    },
    VALIDATION: {
        REQUIRED_DOCUMENTS: [
            'sop_manual',
            'production_plan',
            'land_title_deed',
        ],
    },
};
