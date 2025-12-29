/**
 * Request Validation Middleware
 * Comprehensive validation for GACP application data
 */

const Joi = require('joi');


/**
 * Generic request validation middleware
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    let joiSchema;
    // Use Joi.isSchema() to properly check if it's already a Joi schema
    if (Joi.isSchema(schema)) {
      joiSchema = schema;
    } else {
      // Convert simple object to Joi schema
      joiSchema = Joi.object(schema);
    }

    const { error, value } = joiSchema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorDetails,
      });
    }

    // Replace request data with validated data
    req[source] = value;
    next();
  };
};

/**
 * Joi validation schemas for GACP application
 */
const schemas = {
  // Farm Information Validation
  farmInformation: Joi.object({
    farmName: Joi.string().required().min(2).max(100).trim(),

    location: Joi.object({
      address: Joi.string().required().min(10).max(200),
      subdistrict: Joi.string().required().min(2).max(50),
      district: Joi.string().required().min(2).max(50),
      province: Joi.string().required().min(2).max(50),
      postalCode: Joi.string()
        .pattern(/^\d{5}$/)
        .required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      }).optional(),
    }).required(),

    farmSize: Joi.object({
      totalArea: Joi.number().positive().required(),
      cultivatedArea: Joi.number().positive().required(),
      unit: Joi.string().valid('rai', 'hectare', 'sqm').default('rai'),
    }).required(),

    landOwnership: Joi.object({
      type: Joi.string().valid('owned', 'rented', 'cooperative', 'other').required(),
      documents: Joi.array().items(Joi.string()).min(1).required(),
      ownerName: Joi.string().when('type', {
        is: 'owned',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
      contractDetails: Joi.string().when('type', {
        is: 'rented',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    }).required(),

    waterSource: Joi.object({
      type: Joi.string()
        .valid('groundwater', 'surface_water', 'rainwater', 'municipal', 'other')
        .required(),
      quality: Joi.string().valid('excellent', 'good', 'fair', 'poor').required(),
      availability: Joi.string().valid('year_round', 'seasonal', 'limited').required(),
      testResults: Joi.array()
        .items(
          Joi.object({
            parameter: Joi.string().required(),
            value: Joi.number().required(),
            unit: Joi.string().required(),
            date: Joi.date().required(),
          }),
        )
        .optional(),
    }).required(),

    soilType: Joi.object({
      type: Joi.string().valid('clay', 'sandy', 'loam', 'silt', 'mixed').required(),
      ph: Joi.number().min(0).max(14).required(),
      organicMatter: Joi.number().min(0).max(100).optional(),
      testDate: Joi.date().required(),
    }).required(),

    farmingSystem: Joi.string()
      .valid('conventional', 'organic', 'integrated', 'traditional')
      .required(),
  }),

  // Crop Information Validation
  cropInformation: Joi.array()
    .items(
      Joi.object({
        cropType: Joi.string()
          .valid(
            'rice',
            'vegetables',
            'herbs',
            'fruits',
            'legumes',
            'root_crops',
            'cereals',
            'spices',
            'medicinal_plants',
          )
          .required(),

        variety: Joi.string().required().min(2).max(50),

        plantingArea: Joi.number().positive().required(),

        plantingDate: Joi.date().required(),

        expectedHarvestDate: Joi.date().greater(Joi.ref('plantingDate')).required(),

        cultivationMethod: Joi.string()
          .valid('direct_seeding', 'transplanting', 'grafting', 'cutting')
          .required(),

        irrigationSystem: Joi.string()
          .valid('flood', 'drip', 'sprinkler', 'furrow', 'manual')
          .required(),

        expectedYield: Joi.number().positive().required(),

        intendedUse: Joi.string()
          .valid('fresh_consumption', 'processing', 'export', 'seed_production', 'medicinal')
          .required(),
      }),
    )
    .min(1)
    .required(),

  // Application Creation Schema - Moved below after farmInformation declaration
  // Will be added after schemas object is complete

  // Review Decision Schema
  reviewDecision: Joi.object({
    decision: Joi.string()
      .valid('approved_for_inspection', 'revision_required', 'rejected')
      .required(),

    notes: Joi.string().min(10).max(1000).required(),

    recommendations: Joi.array().items(Joi.string().min(5).max(200)).optional(),

    revisionRequirements: Joi.array()
      .items(
        Joi.object({
          category: Joi.string().required(),
          requirement: Joi.string().required(),
          priority: Joi.string().valid('high', 'medium', 'low').default('medium'),
        }),
      )
      .optional(),

    practicesData: Joi.object({
      pestManagement: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
      waterManagement: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
      soilManagement: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
      recordKeeping: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
    }).optional(),
  }),

  // Inspection Assessment Schema
  inspectionAssessment: Joi.object({
    category: Joi.string()
      .valid(
        'seed_planting_material',
        'soil_management',
        'pest_disease_management',
        'harvesting_practices',
        'post_harvest_handling',
        'storage_transportation',
        'record_keeping',
        'worker_training',
      )
      .required(),

    criterionId: Joi.string().required(),

    compliance: Joi.string()
      .valid('compliant', 'minor_issue', 'major_issue', 'critical_issue')
      .required(),

    score: Joi.number().min(0).max(100).optional(),

    notes: Joi.string().min(5).max(500).required(),

    evidence: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().valid('photo', 'document', 'measurement', 'observation').required(),
          description: Joi.string().required(),
          value: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
        }),
      )
      .optional(),

    recommendations: Joi.array().items(Joi.string().min(5).max(200)).optional(),

    correctiveActions: Joi.array()
      .items(
        Joi.object({
          action: Joi.string().required(),
          timeline: Joi.string().required(),
          priority: Joi.string().valid('immediate', 'short_term', 'long_term').required(),
        }),
      )
      .optional(),

    gpsLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).optional(),

    photos: Joi.array().items(Joi.string().uri()).optional(),
  }),

  // Inspection Completion Schema
  inspectionCompletion: Joi.object({
    finalNotes: Joi.string().min(20).max(2000).required(),

    overallRecommendation: Joi.string()
      .valid('approve', 'conditional_approve', 'reject')
      .optional(),

    weatherConditions: Joi.object({
      temperature: Joi.number().min(-50).max(50).optional(),
      humidity: Joi.number().min(0).max(100).optional(),
      weather: Joi.string().valid('sunny', 'cloudy', 'rainy', 'windy', 'stormy').optional(),
    }).optional(),

    inspectionDuration: Joi.number().positive().optional(),

    followUpRequired: Joi.boolean().default(false),

    followUpDate: Joi.date().when('followUpRequired', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),

  // User Registration Schema
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required(),
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\-()s]+$/)
      .required(),
    nationalId: Joi.string()
      .pattern(/^\d{13}$/)
      .required(),
    role: Joi.string().valid('farmer', 'dtam_officer', 'inspector').required(),

    // Role-specific fields
    farmingExperience: Joi.number().min(0).max(100).when('role', {
      is: 'farmer',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    farmerType: Joi.string().valid('individual', 'cooperative', 'enterprise').when('role', {
      is: 'farmer',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),

    workLocation: Joi.object({
      provinces: Joi.array().items(Joi.string()).min(1).required(),
      districts: Joi.array().items(Joi.string()).optional(),
    }).when('role', {
      is: Joi.any().valid('dtam_officer', 'inspector'),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    expertise: Joi.object({
      cropTypes: Joi.array().items(Joi.string()).min(1).required(),
      certifications: Joi.array().items(Joi.string()).optional(),
      experience: Joi.number().min(0).required(),
    }).when('role', {
      is: 'inspector',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),

  // Query Parameters Schema
  applicationQuery: Joi.object({
    status: Joi.string()
      .valid(
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'inspection_scheduled',
        'inspection_in_progress',
        'inspection_completed',
        'approved',
        'rejected',
        'certificate_issued',
        'certificate_revoked',
      )
      .optional(),

    province: Joi.string().min(2).max(50).optional(),
    cropType: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'applicationNumber', 'farmName', 'currentStatus')
      .default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),

    // Date range filtering
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),

    // Search
    search: Joi.string().min(2).max(100).optional(),
  }),
};

// Add createApplication schema after schemas object is complete
schemas.createApplication = Joi.object({
  farmInformation: schemas.farmInformation,
  cropInformation: schemas.cropInformation,
  documents: Joi.array()
    .items(
      Joi.object({
        documentType: Joi.string()
          .valid(
            'land_certificate',
            'water_permit',
            'farming_plan',
            'cultivation_record',
            'input_record',
            'other',
          )
          .required(),
        filename: Joi.string().required(),
        description: Joi.string().max(200).optional(),
      }),
    )
    .optional(),
});

/**
 * Specific validation middlewares
 */
const validateFarmInformation = validateRequest(schemas.farmInformation);
const validateCropInformation = validateRequest(schemas.cropInformation);
const validateCreateApplication = validateRequest(schemas.createApplication);
const validateReviewDecision = validateRequest(schemas.reviewDecision);
const validateInspectionAssessment = validateRequest(schemas.inspectionAssessment);
const validateInspectionCompletion = validateRequest(schemas.inspectionCompletion);
const validateUserRegistration = validateRequest(schemas.userRegistration);
const validateApplicationQuery = validateRequest(schemas.applicationQuery, 'query');

/**
 * Custom validation for file uploads
 */
const validateFileUpload = (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const errors = [];

    req.files.forEach((file, index) => {
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        errors.push(
          `File ${index + 1}: Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        );
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`File ${index + 1}: File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      }

      // Check filename
      if (!file.originalname || file.originalname.length > 255) {
        errors.push(`File ${index + 1}: Invalid filename`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        errors,
      });
    }

    next();
  };
};

/**
 * Sanitize and normalize data
 */
const sanitizeInput = (req, res, next) => {
  // Remove potential XSS and normalize strings
  const sanitizeObject = obj => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === 'object') {
      const sanitized = {};
      Object.keys(obj).forEach(key => {
        sanitized[key] = sanitizeObject(obj[key]);
      });
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Validate Thai national ID
 */
const validateThaiNationalId = nationalId => {
  if (!/^\d{13}$/.test(nationalId)) {
    return false;
  }

  const digits = nationalId.split('').map(Number);
  const checkDigit = digits.pop();

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }

  const calculatedCheckDigit = (11 - (sum % 11)) % 10;

  return calculatedCheckDigit === checkDigit;
};

/**
 * Custom validator for Thai postal code
 */
const validateThaiPostalCode = postalCode => {
  return /^\d{5}$/.test(postalCode);
};

/**
 * Validate coordinates are within Thailand bounds
 */
const validateThailandCoordinates = (latitude, longitude) => {
  // Thailand approximate bounds
  const minLat = 5.5;
  const maxLat = 20.5;
  const minLng = 97.0;
  const maxLng = 106.0;

  return latitude >= minLat && latitude <= maxLat && longitude >= minLng && longitude <= maxLng;
};

module.exports = {
  validateRequest,
  schemas,
  validateFarmInformation,
  validateCropInformation,
  validateCreateApplication,
  validateReviewDecision,
  validateInspectionAssessment,
  validateInspectionCompletion,
  validateUserRegistration,
  validateApplicationQuery,
  validateFileUpload,
  sanitizeInput,
  validateThaiNationalId,
  validateThaiPostalCode,
  validateThailandCoordinates,
};
