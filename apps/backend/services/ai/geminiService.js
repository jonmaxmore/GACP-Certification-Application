/**
 * Google Gemini AI Service
 * For OCR, document validation, and image analysis
 * Using stable @google/generative-ai SDK (Gemini 1.5)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
// Alternative SDK (experimental): const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const logger = require('../../shared/logger');

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAK4-JhjPuSX0Ghs7Mp5n0iv_E7eyhb4Eg';
    if (!this.apiKey) {
      logger.error('GEMINI_API_KEY not configured');
      throw new Error('Gemini API key is required');
    }

    // Using stable SDK - cost-effective and production-ready
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Convert image file to Gemini API format
   */
  async fileToGenerativePart(imagePath) {
    try {
      const imageData = await fs.readFile(imagePath);
      return {
        inlineData: {
          data: imageData.toString('base64'),
          mimeType: 'image/jpeg',
        },
      };
    } catch (error) {
      logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * OCR - Extract text from image
   */
  async extractTextFromImage(imagePath) {
    try {
      const imagePart = await this.fileToGenerativePart(imagePath);

      const prompt = `Extract all text from this image.
      Return ONLY the extracted text, maintaining the original layout and formatting.
      If the image contains Thai text, ensure accurate Thai character recognition.
      Do not add any commentary or description.`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        extractedText: text,
        confidence: 0.85,
      };
    } catch (error) {
      logger.error('OCR extraction error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate GACP application documents
   */
  async validateGACPDocument(imagePath, documentType) {
    try {
      const imagePart = await this.fileToGenerativePart(imagePath);

      const prompt = `Analyze this ${documentType} document for GACP (Good Agricultural and Collection Practices) certification.

Required information to extract:
- Farm name and registration number
- Farmer name and ID
- Farm location (province, district, sub-district)
- Crop type and cultivation area
- Farming practices mentioned
- Chemical usage records (if any)
- Certification status or previous certifications

Validation criteria:
1. Document clarity and readability (1-10)
2. Completeness of information (1-10)
3. Document authenticity indicators (1-10)
4. Data consistency (1-10)

Return a JSON object with:
{
  "documentType": "${documentType}",
  "extractedData": {
    "farmName": "",
    "registrationNumber": "",
    "farmerName": "",
    "farmerID": "",
    "location": {
      "province": "",
      "district": "",
      "subDistrict": ""
    },
    "cropInfo": {
      "type": "",
      "area": ""
    },
    "practices": [],
    "chemicalUsage": [],
    "certificationHistory": []
  },
  "validation": {
    "clarity": 0,
    "completeness": 0,
    "authenticity": 0,
    "consistency": 0,
    "overallScore": 0
  },
  "issues": [],
  "recommendations": []
}`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      let jsonData;
      try {
        // Try to extract JSON from markdown code block if present
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[1]);
        } else {
          jsonData = JSON.parse(text);
        }
      } catch (parseError) {
        logger.warn('Failed to parse JSON response, using text response');
        jsonData = { rawResponse: text };
      }

      return {
        success: true,
        data: jsonData,
      };
    } catch (error) {
      logger.error('Document validation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze image quality for farm inspection
   */
  async analyzeImageQuality(imagePath) {
    try {
      const imagePart = await this.fileToGenerativePart(imagePath);

      const prompt = `Analyze this farm/agricultural image quality for inspection purposes.

Evaluate:
1. Image clarity and sharpness (1-10)
2. Lighting conditions (1-10)
3. Focus and detail visibility (1-10)
4. Angle and framing appropriateness (1-10)
5. Presence of relevant inspection elements (crops, equipment, facilities)

Also identify:
- What is visible in the image (crops, structures, equipment, people)
- Any visible issues or concerns (pests, diseases, poor conditions)
- Whether this image is suitable for remote inspection

Return JSON:
{
  "quality": {
    "clarity": 0,
    "lighting": 0,
    "focus": 0,
    "framing": 0,
    "overallScore": 0
  },
  "content": {
    "visibleElements": [],
    "identifiedCrops": [],
    "structures": [],
    "equipment": []
  },
  "suitableForRemoteInspection": true/false,
  "issues": [],
  "recommendations": []
}`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      let jsonData;
      try {
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[1]);
        } else {
          jsonData = JSON.parse(text);
        }
      } catch (parseError) {
        jsonData = { rawResponse: text };
      }

      return {
        success: true,
        data: jsonData,
      };
    } catch (error) {
      logger.error('Image quality analysis error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Comprehensive AI QC for GACP application
   */
  async performAIQC(applicationData) {
    try {
      const results = {
        applicationId: applicationData.id,
        timestamp: new Date(),
        scores: {},
        overallScore: 0,
        inspectionType: 'ONSITE', // Default
        issues: [],
        recommendations: [],
      };

      // 1. Document Validation
      if (applicationData.documents && applicationData.documents.length > 0) {
        const docResults = [];
        for (const doc of applicationData.documents) {
          if (doc.filePath) {
            const validation = await this.validateGACPDocument(doc.filePath, doc.type);
            if (validation.success) {
              docResults.push(validation.data);
            }
          }
        }

        if (docResults.length > 0) {
          const avgDocScore =
            docResults.reduce((sum, r) => sum + (r.validation?.overallScore || 0), 0) /
            docResults.length;
          results.scores.documentValidation = avgDocScore;
        }
      }

      // 2. Image Quality Analysis
      if (applicationData.images && applicationData.images.length > 0) {
        const imageResults = [];
        for (const img of applicationData.images) {
          if (img.filePath) {
            const analysis = await this.analyzeImageQuality(img.filePath);
            if (analysis.success) {
              imageResults.push(analysis.data);
            }
          }
        }

        if (imageResults.length > 0) {
          const avgImageScore =
            imageResults.reduce((sum, r) => sum + (r.quality?.overallScore || 0), 0) /
            imageResults.length;
          results.scores.imageQuality = avgImageScore;
        }
      }

      // 3. Data Completeness Check
      const requiredFields = [
        'farmer.name',
        'farmer.idCard',
        'farm.name',
        'farm.location',
        'farm.area',
        'lotId',
      ];

      let completenessScore = 0;
      requiredFields.forEach(field => {
        const value = this.getNestedValue(applicationData, field);
        if (value && value !== '') {
          completenessScore += 10 / requiredFields.length;
        }
      });
      results.scores.dataCompleteness = completenessScore;

      // 4. Calculate Overall Score
      const scores = Object.values(results.scores);
      results.overallScore =
        scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

      // 5. Determine Inspection Type based on score
      if (results.overallScore >= 90) {
        results.inspectionType = 'VIDEO';
        results.recommendations.push('High quality submission - suitable for video inspection');
      } else if (results.overallScore >= 70) {
        results.inspectionType = 'HYBRID';
        results.recommendations.push('Good quality submission - hybrid inspection recommended');
      } else {
        results.inspectionType = 'ONSITE';
        results.recommendations.push('Issues detected - full onsite inspection required');
      }

      // 6. Identify Issues
      if (results.scores.documentValidation < 7) {
        results.issues.push('Document quality needs improvement');
      }
      if (results.scores.imageQuality < 7) {
        results.issues.push('Image quality insufficient for remote inspection');
      }
      if (results.scores.dataCompleteness < 8) {
        results.issues.push('Incomplete application data');
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      logger.error('AI QC error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Helper to get nested object value
   */
  getNestedValue(obj, path) {
    return path
      .split('.')
      .reduce(
        (current, prop) => (current && current[prop] !== undefined ? current[prop] : null),
        obj,
      );
  }

  /**
   * Batch OCR processing
   */
  async batchOCR(imagePaths) {
    const results = [];
    for (const imagePath of imagePaths) {
      const result = await this.extractTextFromImage(imagePath);
      results.push({
        imagePath,
        ...result,
      });
    }
    return results;
  }

  /**
   * Compare documents for consistency
   */
  async compareDocuments(doc1Path, doc2Path) {
    try {
      const doc1 = await this.extractTextFromImage(doc1Path);
      const doc2 = await this.extractTextFromImage(doc2Path);

      if (!doc1.success || !doc2.success) {
        throw new Error('Failed to extract text from one or both documents');
      }

      const prompt = `Compare these two extracted texts and identify:
1. Common information (matching data)
2. Discrepancies (conflicting data)
3. Missing information in either document
4. Consistency score (0-10)

Document 1:
${doc1.extractedText}

Document 2:
${doc2.extractedText}

Return JSON:
{
  "commonInfo": [],
  "discrepancies": [],
  "missingInDoc1": [],
  "missingInDoc2": [],
  "consistencyScore": 0,
  "summary": ""
}`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let jsonData;
      try {
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[1]);
        } else {
          jsonData = JSON.parse(text);
        }
      } catch (parseError) {
        jsonData = { rawResponse: text };
      }

      return {
        success: true,
        data: jsonData,
      };
    } catch (error) {
      logger.error('Document comparison error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new GeminiAIService();
