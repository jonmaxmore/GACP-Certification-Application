const express = require('express');
const router = express.Router();

// Mock survey templates for different regions
const mockSurveyTemplates = {
  northern: {
    id: 'northern',
    name: 'Northern Thailand GACP Survey',
    region: 'Northern',
    description: 'GACP compliance survey for Northern Thailand farming practices',
    questions: [
      {
        id: 'soil_preparation',
        type: 'multiple_choice',
        category: 'Soil Management',
        question: 'How do you prepare your soil before planting?',
        options: [
          'Organic composting',
          'Chemical fertilizers',
          'Mixed organic and chemical',
          'Natural soil with no additives',
        ],
        required: true,
      },
      {
        id: 'water_source',
        type: 'multiple_choice',
        category: 'Water Management',
        question: 'What is your primary water source for irrigation?',
        options: [
          'Natural rainwater',
          'River/stream water',
          'Well water',
          'Municipal water supply',
        ],
        required: true,
      },
      {
        id: 'pest_control',
        type: 'multiple_choice',
        category: 'Pest Control',
        question: 'How do you manage pests and diseases?',
        options: [
          'Organic pesticides only',
          'Biological control methods',
          'Integrated pest management',
          'Chemical pesticides',
          'No pest control',
        ],
        required: true,
      },
      {
        id: 'harvest_timing',
        type: 'text',
        category: 'Harvesting',
        question: 'Describe your harvesting schedule and methods',
        required: true,
      },
      {
        id: 'certification_knowledge',
        type: 'rating',
        category: 'GACP Knowledge',
        question: 'Rate your understanding of GACP standards (1-5)',
        min: 1,
        max: 5,
        required: true,
      },
    ],
  },
  central: {
    id: 'central',
    name: 'Central Thailand GACP Survey',
    region: 'Central',
    description: 'GACP compliance survey for Central Thailand farming practices',
    questions: [
      {
        id: 'rice_variety',
        type: 'multiple_choice',
        category: 'Crop Management',
        question: 'Which rice varieties do you primarily grow?',
        options: [
          'Jasmine Rice (KDML 105)',
          'Pathumthani 1',
          'RD6',
          'Organic local varieties',
          'Other',
        ],
        required: true,
      },
      {
        id: 'fertilizer_type',
        type: 'multiple_choice',
        category: 'Fertilizer Management',
        question: 'What type of fertilizers do you use?',
        options: [
          'Organic compost',
          'Chemical NPK',
          'Bio-fertilizers',
          'Mixed organic-chemical',
          'No fertilizers',
        ],
        required: true,
      },
      {
        id: 'storage_method',
        type: 'multiple_choice',
        category: 'Post-Harvest',
        question: 'How do you store your harvested products?',
        options: [
          'Climate-controlled storage',
          'Traditional barn storage',
          'Plastic containers',
          'Silo storage',
          'Open air drying',
        ],
        required: true,
      },
      {
        id: 'market_access',
        type: 'text',
        category: 'Marketing',
        question: 'Describe your main market channels and customers',
        required: true,
      },
      {
        id: 'gacp_training',
        type: 'yes_no',
        category: 'Training',
        question: 'Have you received formal GACP training?',
        required: true,
      },
    ],
  },
  southern: {
    id: 'southern',
    name: 'Southern Thailand GACP Survey',
    region: 'Southern',
    description: 'GACP compliance survey for Southern Thailand farming practices',
    questions: [
      {
        id: 'crop_types',
        type: 'multiple_choice',
        category: 'Crop Diversity',
        question: 'What medicinal plants do you primarily cultivate?',
        options: ['Turmeric', 'Ginger', 'Lemongrass', 'Galangal', 'Kaffir lime', 'Other herbs'],
        required: true,
      },
      {
        id: 'climate_adaptation',
        type: 'multiple_choice',
        category: 'Climate Management',
        question: 'How do you adapt to monsoon season?',
        options: [
          'Drainage systems',
          'Raised bed cultivation',
          'Greenhouse protection',
          'Seasonal crop rotation',
          'No special measures',
        ],
        required: true,
      },
      {
        id: 'organic_certification',
        type: 'yes_no',
        category: 'Certification',
        question: 'Do you have organic certification for your products?',
        required: true,
      },
      {
        id: 'processing_methods',
        type: 'text',
        category: 'Processing',
        question: 'Describe your post-harvest processing methods',
        required: true,
      },
      {
        id: 'sustainability_practices',
        type: 'rating',
        category: 'Sustainability',
        question: 'Rate your implementation of sustainable farming practices (1-5)',
        min: 1,
        max: 5,
        required: true,
      },
    ],
  },
  northeastern: {
    id: 'northeastern',
    name: 'Northeastern Thailand GACP Survey',
    region: 'Northeastern',
    description: 'GACP compliance survey for Northeastern Thailand farming practices',
    questions: [
      {
        id: 'drought_management',
        type: 'multiple_choice',
        category: 'Water Scarcity',
        question: 'How do you manage during dry seasons?',
        options: [
          'Drip irrigation systems',
          'Rainwater harvesting',
          'Drought-resistant varieties',
          'Water storage tanks',
          'Reduce cultivation area',
        ],
        required: true,
      },
      {
        id: 'soil_salinity',
        type: 'multiple_choice',
        category: 'Soil Issues',
        question: 'How do you deal with soil salinity problems?',
        options: [
          'Organic soil amendments',
          'Salt-tolerant crops',
          'Improved drainage',
          'Gypsum application',
          'No salinity issues',
        ],
        required: true,
      },
      {
        id: 'traditional_knowledge',
        type: 'text',
        category: 'Indigenous Practices',
        question: 'What traditional farming knowledge do you apply?',
        required: true,
      },
      {
        id: 'community_cooperation',
        type: 'yes_no',
        category: 'Cooperation',
        question: 'Do you participate in farmer cooperatives or groups?',
        required: true,
      },
      {
        id: 'income_diversification',
        type: 'multiple_choice',
        category: 'Economics',
        question: 'What other income sources do you have besides farming?',
        options: [
          'Livestock raising',
          'Handicraft production',
          'Off-farm employment',
          'Agricultural services',
          'Farming only',
        ],
        required: true,
      },
    ],
  },
};

// Mock survey responses storage
const mockSurveyResponses = [];

/**
 * @route GET /api/survey/templates
 * @desc Get all available survey templates
 * @access Public
 */
router.get('/templates', (req, res) => {
  try {
    const templates = Object.values(mockSurveyTemplates).map(template => ({
      id: template.id,
      name: template.name,
      region: template.region,
      description: template.description,
      questionCount: template.questions.length,
    }));

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey/templates/:region
 * @desc Get survey template for specific region
 * @access Public
 */
router.get('/templates/:region', (req, res) => {
  try {
    const { region } = req.params;
    const template = mockSurveyTemplates[region.toLowerCase()];

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Survey template not found for this region',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/survey/responses
 * @desc Submit survey response
 * @access Public
 */
router.post('/responses', (req, res) => {
  try {
    const { region, answers, farmerInfo } = req.body;

    if (!region || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Region and answers are required',
      });
    }

    const response = {
      id: `response_${Date.now()}`,
      region,
      answers,
      farmerInfo: farmerInfo || {},
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };

    mockSurveyResponses.push(response);

    // Calculate compliance score based on answers
    const complianceScore = calculateComplianceScore(region, answers);

    res.status(201).json({
      success: true,
      data: {
        responseId: response.id,
        complianceScore,
        recommendations: generateRecommendations(region, answers, complianceScore),
      },
      message: 'Survey response submitted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey/responses
 * @desc Get all survey responses (for admin)
 * @access Private
 */
router.get('/responses', (req, res) => {
  try {
    const { region, limit = 50 } = req.query;
    let responses = mockSurveyResponses;

    if (region) {
      responses = responses.filter(r => r.region.toLowerCase() === region.toLowerCase());
    }

    responses = responses.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: responses,
      total: responses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey/analytics/:region
 * @desc Get survey analytics for specific region
 * @access Private
 */
router.get('/analytics/:region', (req, res) => {
  try {
    const { region } = req.params;
    const regionResponses = mockSurveyResponses.filter(
      r => r.region.toLowerCase() === region.toLowerCase(),
    );

    const analytics = {
      totalResponses: regionResponses.length,
      averageComplianceScore:
        regionResponses.length > 0
          ? regionResponses.reduce((sum, r) => sum + (r.complianceScore || 70), 0) /
            regionResponses.length
          : 0,
      responsesByMonth: getResponsesByMonth(regionResponses),
      commonIssues: getCommonIssues(regionResponses),
      recommendations: getRegionalRecommendations(region),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/survey/health
 * @desc Health check for Survey API
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'survey',
    timestamp: new Date().toISOString(),
    templatesCount: Object.keys(mockSurveyTemplates).length,
    responsesCount: mockSurveyResponses.length,
    endpoints: [
      'GET /api/survey/templates',
      'GET /api/survey/templates/:region',
      'POST /api/survey/responses',
      'GET /api/survey/responses',
      'GET /api/survey/analytics/:region',
    ],
  });
});

// Helper functions
function calculateComplianceScore(region, answers) {
  // Simple scoring algorithm - in real implementation this would be more sophisticated
  const score = 100;
  let penalties = 0;

  Object.values(answers).forEach(answer => {
    if (typeof answer === 'string') {
      if (answer.toLowerCase().includes('chemical') && !answer.toLowerCase().includes('organic')) {
        penalties += 10;
      } else if (
        answer.toLowerCase().includes('organic') ||
        answer.toLowerCase().includes('sustainable')
      ) {
        penalties -= 5; // bonus for sustainable practices
      }
    } else if (typeof answer === 'number') {
      if (answer < 3) {
        penalties += 15;
      } else if (answer >= 4) {
        penalties -= 5;
      }
    }
  });

  return Math.max(0, Math.min(100, score - penalties));
}

function generateRecommendations(region, answers, score) {
  const recommendations = [];

  if (score < 60) {
    recommendations.push('Consider transitioning to organic farming practices');
    recommendations.push('Attend GACP training workshops');
    recommendations.push('Implement proper record-keeping systems');
  } else if (score < 80) {
    recommendations.push('Improve water management practices');
    recommendations.push('Enhance pest control methods using sustainable approaches');
    recommendations.push('Consider organic certification for premium market access');
  } else {
    recommendations.push('Maintain current excellent practices');
    recommendations.push('Consider becoming a model farm for others');
    recommendations.push('Explore export market opportunities');
  }

  return recommendations;
}

function getResponsesByMonth(responses) {
  // Mock monthly distribution
  return {
    January: Math.floor(responses.length * 0.1),
    February: Math.floor(responses.length * 0.08),
    March: Math.floor(responses.length * 0.12),
    April: Math.floor(responses.length * 0.15),
    May: Math.floor(responses.length * 0.15),
    June: Math.floor(responses.length * 0.1),
    July: Math.floor(responses.length * 0.05),
    August: Math.floor(responses.length * 0.05),
    September: Math.floor(responses.length * 0.08),
    October: Math.floor(responses.length * 0.12),
    November: Math.floor(responses.length * 0.08),
    December: Math.floor(responses.length * 0.02),
  };
}

function getCommonIssues(_responses) {
  return [
    'Water scarcity during dry season',
    'Lack of organic certification knowledge',
    'Limited access to sustainable pest control methods',
    'Inadequate storage facilities',
    'Limited market access for premium products',
  ];
}

function getRegionalRecommendations(region) {
  const regionalRecs = {
    northern: [
      'Implement terraced farming for sloped terrain',
      'Use cold-season vegetable rotation',
      'Establish community water management systems',
    ],
    central: [
      'Optimize rice-fish farming systems',
      'Improve mechanization for efficiency',
      'Develop direct marketing channels',
    ],
    southern: [
      'Implement proper drainage for monsoon season',
      'Focus on medicinal plant certification',
      'Develop agrotourism opportunities',
    ],
    northeastern: [
      'Implement drought-resistant crop varieties',
      'Establish farmer cooperative networks',
      'Develop value-added processing capabilities',
    ],
  };

  return regionalRecs[region.toLowerCase()] || regionalRecs.central;
}

module.exports = router;
