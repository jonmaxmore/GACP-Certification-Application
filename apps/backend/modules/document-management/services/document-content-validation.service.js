const { createLogger } = require('../../../shared/logger');
const logger = createLogger('document-management-document-content-validation.service');

/**
 * Document Content Validation Service
 *
 * Purpose: ตรวจสอบเนื้อหาเอกสารด้วย OCR และ business rules
 *
 * Business Logic:
 * 1. Farm License → ตรวจสอบเลขที่ใบอนุญาต, วันหมดอายุ, ชื่อเกษตรกร
 * 2. ID Card → ตรวจสอบเลขบัตรประชาชน, ชื่อ-นามสกุล, วันหมดอายุ
 * 3. Land Document → ตรวจสอบเลขที่โฉนดที่ดิน, ที่ตั้งพื้นที่
 * 4. GAP Certificate → ตรวจสอบเลขที่ใบรับรอง, มาตรฐาน, วันหมดอายุ
 * 5. Crop Details → ตรวจสอบประเภทพืช, พื้นที่เพาะปลูก
 *
 * Validation Process:
 * 1. OCR Text Extraction
 * 2. Pattern Recognition
 * 3. Business Rule Validation
 * 4. Cross-Reference Verification
 * 5. Quality Assessment
 */

class DocumentContentValidationService {
  constructor({ ocrService, documentPatterns, databaseService }) {
    this.ocrService = ocrService;
    this.documentPatterns = documentPatterns || this._getDefaultPatterns();
    this.databaseService = databaseService;
  }

  /**
   * ตรวจสอบเนื้อหาเอกสารตามประเภท
   * @param {string} documentId - ID ของเอกสาร
   * @param {string} documentType - ประเภทเอกสาร
   * @param {Buffer} fileBuffer - ไฟล์เอกสาร
   * @param {Object} applicationData - ข้อมูล application สำหรับ cross-reference
   * @returns {Object} ผลการตรวจสอบ
   */
  async validateDocumentContent(documentId, documentType, fileBuffer, applicationData = {}) {
    try {
      logger.info(`🔍 Starting content validation for ${documentType}: ${documentId}`);

      // 1. OCR Text Extraction
      const ocrResults = await this._extractTextWithOCR(fileBuffer, documentType);
      if (!ocrResults.success) {
        return {
          valid: false,
          confidence: 0,
          errors: ['Failed to extract text from document'],
          extractedData: {},
        };
      }

      logger.info(`📝 OCR extraction completed with confidence: ${ocrResults.confidence}%`);

      // 2. Validate based on document type
      const validationResult = await this._validateByDocumentType(
        documentType,
        ocrResults.extractedText,
        applicationData,
      );

      // 3. Calculate overall confidence
      const overallConfidence = this._calculateOverallConfidence(
        ocrResults.confidence,
        validationResult.validationScore,
      );

      // 4. Determine if validation passed
      const isValid = overallConfidence >= 75 && validationResult.criticalFieldsValid;

      return {
        valid: isValid,
        confidence: overallConfidence,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        extractedData: validationResult.extractedData,
        validationDetails: {
          ocrConfidence: ocrResults.confidence,
          validationScore: validationResult.validationScore,
          criticalFieldsValid: validationResult.criticalFieldsValid,
        },
      };
    } catch (error) {
      logger.error(`❌ Document validation failed for ${documentId}:`, error);
      return {
        valid: false,
        confidence: 0,
        errors: ['System error during validation'],
        extractedData: {},
      };
    }
  }

  /**
   * ตรวจสอบเอกสารตามประเภท
   */
  async _validateByDocumentType(documentType, extractedText, applicationData) {
    switch (documentType) {
      case 'FARM_LICENSE':
        return await this._validateFarmLicense(extractedText, applicationData);

      case 'ID_CARD':
        return await this._validateIdCard(extractedText, applicationData);

      case 'LAND_DOCUMENT':
        return await this._validateLandDocument(extractedText, applicationData);

      case 'GAP_CERTIFICATE':
        return await this._validateGAPCertificate(extractedText, applicationData);

      case 'CROP_DETAILS':
        return await this._validateCropDetails(extractedText, applicationData);

      default:
        return await this._validateGenericDocument(extractedText, applicationData);
    }
  }

  /**
   * ตรวจสอบใบอนุญาทเกษตรกร
   */
  async _validateFarmLicense(text, applicationData) {
    const errors = [];
    const warnings = [];
    const extractedData = {};
    let validationScore = 0;
    let criticalFieldsValid = true;

    try {
      // 1. ตรวจสอบเลขที่ใบอนุญาต
      const licenseNumberPattern = /(?:เลขที่|ใบอนุญาต|License.*No)[:.]*([A-Z0-9./]+)/i;
      const licenseMatch = text.match(licenseNumberPattern);

      if (licenseMatch) {
        extractedData.licenseNumber = licenseMatch[1].trim();
        validationScore += 25;
        logger.info(`✅ License number found: ${extractedData.licenseNumber}`);
      } else {
        errors.push('ไม่พบเลขที่ใบอนุญาต');
        criticalFieldsValid = false;
      }

      // 2. ตรวจสอบชื่อเกษตรกร
      if (applicationData.farmerProfile?.fullName) {
        const farmerName = applicationData.farmerProfile.fullName;
        const namePattern = new RegExp(farmerName.replace(/.+/g, '.s*'), 'i');

        if (namePattern.test(text)) {
          extractedData.farmerName = farmerName;
          validationScore += 25;
          logger.info(`✅ Farmer name verified: ${farmerName}`);
        } else {
          errors.push(`ชื่อเกษตรกรในเอกสารไม่ตรงกับใบสมัคร (${farmerName})`);
          criticalFieldsValid = false;
        }
      }

      // 3. ตรวจสอบวันหมดอายุ
      const expiryPattern =
        /(?:หมดอายุ|วันที่สิ้นสุด|Expires?)[:.]*(.{1,2}[/..].{1,2}[/..](?:.{2}|.{4}))/i;
      const expiryMatch = text.match(expiryPattern);

      if (expiryMatch) {
        const expiryDate = this._parseDate(expiryMatch[1]);
        extractedData.expiryDate = expiryDate;

        if (expiryDate && expiryDate > new Date()) {
          validationScore += 20;
          logger.info(`✅ Valid expiry date: ${expiryDate.toLocaleDateString('th-TH')}`);
        } else {
          errors.push('ใบอนุญาตหมดอายุแล้ว');
          criticalFieldsValid = false;
        }
      } else {
        warnings.push('ไม่พบวันหมดอายุในเอกสาร');
      }

      // 4. ตรวจสอบประเภทการเกษตร
      const farmTypeKeywords = ['เพาะปลูก', 'ปลูก', 'เกษตร', 'กัญชา', 'cannabis', 'hemp'];
      const foundFarmTypes = farmTypeKeywords.filter(keyword =>
        new RegExp(keyword, 'i').test(text),
      );

      if (foundFarmTypes.length > 0) {
        extractedData.farmType = foundFarmTypes;
        validationScore += 15;
        logger.info(`✅ Farm type keywords found: ${foundFarmTypes.join(', ')}`);
      } else {
        warnings.push('ไม่พบข้อมูลประเภทการเกษตร');
      }

      // 5. ตรวจสอบหน่วยงานออกใบอนุญาต
      const authorityKeywords = ['กรมวิชาการเกษตร', 'DOA', 'กระทรวงเกษตร', 'เกษตรจังหวัด'];
      const foundAuthority = authorityKeywords.find(keyword => new RegExp(keyword, 'i').test(text));

      if (foundAuthority) {
        extractedData.issuingAuthority = foundAuthority;
        validationScore += 15;
        logger.info(`✅ Issuing authority found: ${foundAuthority}`);
      } else {
        warnings.push('ไม่พบข้อมูลหน่วยงานที่ออกใบอนุญาต');
      }

      return {
        extractedData,
        errors,
        warnings,
        validationScore,
        criticalFieldsValid,
      };
    } catch (error) {
      logger.error('Error validating farm license:', error);
      return {
        extractedData: {},
        errors: ['เกิดข้อผิดพลาดในการตรวจสอบใบอนุญาต'],
        warnings: [],
        validationScore: 0,
        criticalFieldsValid: false,
      };
    }
  }

  /**
   * ตรวจสอบบัตรประชาชน
   */
  async _validateIdCard(text, applicationData) {
    const errors = [];
    const warnings = [];
    const extractedData = {};
    let validationScore = 0;
    let criticalFieldsValid = true;

    try {
      // 1. ตรวจสอบเลขบัตรประชาชน
      const idPattern = /(?:เลขประจำตัว|ID.*No)[:.]*(.{1}-?.{4}-?.{5}-?.{2}-?.{1})/i;
      const idMatch = text.match(idPattern);

      if (idMatch) {
        const idNumber = idMatch[1].replace(/./g, '');
        extractedData.idNumber = idNumber;

        // ตรวจสอบ checksum เลขบัตรประชาชน
        if (this._validateThaiIdChecksum(idNumber)) {
          validationScore += 30;
          logger.info(`✅ Valid Thai ID number: ${idNumber}`);
        } else {
          errors.push('เลขบัตรประชาชนไม่ถูกต้อง');
          criticalFieldsValid = false;
        }
      } else {
        errors.push('ไม่พบเลขบัตรประชาชน');
        criticalFieldsValid = false;
      }

      // 2. ตรวจสอบชื่อ-นามสกุล
      if (applicationData.farmerProfile?.fullName) {
        const farmerName = applicationData.farmerProfile.fullName;
        const namePattern = new RegExp(farmerName.replace(/.+/g, '.s*'), 'i');

        if (namePattern.test(text)) {
          extractedData.fullName = farmerName;
          validationScore += 25;
          logger.info(`✅ Name verified: ${farmerName}`);
        } else {
          errors.push(`ชื่อในบัตรประชาชนไม่ตรงกับใบสมัคร (${farmerName})`);
          criticalFieldsValid = false;
        }
      }

      // 3. ตรวจสอบวันหมดอายุ
      const expiryPattern = /(?:หมดอายุ|Expires?)[:.]*(.{1,2}[/..].{1,2}[/..](?:.{2}|.{4}))/i;
      const expiryMatch = text.match(expiryPattern);

      if (expiryMatch) {
        const expiryDate = this._parseDate(expiryMatch[1]);
        extractedData.expiryDate = expiryDate;

        if (expiryDate && expiryDate > new Date()) {
          validationScore += 20;
          logger.info(`✅ Valid ID expiry: ${expiryDate.toLocaleDateString('th-TH')}`);
        } else {
          errors.push('บัตรประชาชนหมดอายุแล้ว');
          criticalFieldsValid = false;
        }
      } else {
        warnings.push('ไม่พบวันหมดอายุของบัตรประชาชน');
      }

      // 4. ตรวจสอบวันเกิด
      const birthPattern = /(?:เกิด|Birth)[:.]*(.{1,2}[/..].{1,2}[/..](?:.{2}|.{4}))/i;
      const birthMatch = text.match(birthPattern);

      if (birthMatch) {
        const birthDate = this._parseDate(birthMatch[1]);
        extractedData.birthDate = birthDate;
        validationScore += 15;
        logger.info(`✅ Birth date found: ${birthDate.toLocaleDateString('th-TH')}`);
      }

      // 5. ตรวจสอบที่อยู่
      const addressKeywords = ['ที่อยู่', 'อำเภอ', 'จังหวัด', 'ตำบล'];
      const foundAddress = addressKeywords.some(keyword => new RegExp(keyword, 'i').test(text));

      if (foundAddress) {
        validationScore += 10;
        logger.info('✅ Address information found');
      } else {
        warnings.push('ไม่พบข้อมูลที่อยู่');
      }

      return {
        extractedData,
        errors,
        warnings,
        validationScore,
        criticalFieldsValid,
      };
    } catch (error) {
      logger.error('Error validating ID card:', error);
      return {
        extractedData: {},
        errors: ['เกิดข้อผิดพลาดในการตรวจสอบบัตรประชาชน'],
        warnings: [],
        validationScore: 0,
        criticalFieldsValid: false,
      };
    }
  }

  /**
   * ตรวจสอบเอกสารสิทธิ์ที่ดิน
   */
  async _validateLandDocument(text, applicationData) {
    const errors = [];
    const warnings = [];
    const extractedData = {};
    let validationScore = 0;
    let criticalFieldsValid = true;

    try {
      // 1. ตรวจสอบเลขที่โฉนด/เลขที่ดิน
      const landNumberPattern = /(?:เลขที่|โฉนดเลขที่|ส.ป.ก.|Land.*No)[:.]*([0-9A-Z./]+)/i;
      const landMatch = text.match(landNumberPattern);

      if (landMatch) {
        extractedData.landNumber = landMatch[1].trim();
        validationScore += 30;
        logger.info(`✅ Land number found: ${extractedData.landNumber}`);
      } else {
        errors.push('ไม่พบเลขที่โฉนดที่ดินหรือเลขที่ดิน');
        criticalFieldsValid = false;
      }

      // 2. ตรวจสอบเนื้อที่
      const areaPattern = /(?:เนื้อที่|จำนวน|Area)[:.]*(.+(?:..+)?).*(?:ไร่|rai|hectare|ha)/i;
      const areaMatch = text.match(areaPattern);

      if (areaMatch) {
        extractedData.landArea = parseFloat(areaMatch[1]);
        validationScore += 20;
        logger.info(`✅ Land area found: ${extractedData.landArea} ไร่`);
      } else {
        warnings.push('ไม่พบข้อมูลเนื้อที่ที่ดิน');
      }

      // 3. ตรวจสอบที่ตั้งที่ดิน
      if (applicationData.farmProfile?.location) {
        const location = applicationData.farmProfile.location;
        const locationKeywords = [
          location.province,
          location.district,
          location.subdistrict,
        ].filter(Boolean);

        let locationMatches = 0;
        locationKeywords.forEach(keyword => {
          if (new RegExp(keyword, 'i').test(text)) {
            locationMatches++;
          }
        });

        if (locationMatches >= 2) {
          extractedData.locationVerified = true;
          validationScore += 25;
          console.log(
            `✅ Location verified: ${locationMatches}/${locationKeywords.length} matches`,
          );
        } else {
          errors.push('ที่ตั้งที่ดินไม่ตรงกับที่ระบุในใบสมัคร');
          criticalFieldsValid = false;
        }
      }

      // 4. ตรวจสอบชื่อเจ้าของ
      if (applicationData.farmerProfile?.fullName) {
        const ownerName = applicationData.farmerProfile.fullName;
        const namePattern = new RegExp(ownerName.replace(/.+/g, '.s*'), 'i');

        if (namePattern.test(text)) {
          extractedData.ownerName = ownerName;
          validationScore += 15;
          logger.info(`✅ Land owner name verified: ${ownerName}`);
        } else {
          warnings.push(`ชื่อเจ้าของที่ดินอาจไม่ตรงกับผู้สมัคร (${ownerName})`);
        }
      }

      // 5. ตรวจสอบประเภทการใช้ที่ดิน
      const landUseKeywords = ['เกษตรกรรม', 'ที่ดินเกษตร', 'ปลูกพืช', 'agriculture'];
      const foundLandUse = landUseKeywords.find(keyword => new RegExp(keyword, 'i').test(text));

      if (foundLandUse) {
        extractedData.landUse = foundLandUse;
        validationScore += 10;
        logger.info(`✅ Land use type found: ${foundLandUse}`);
      } else {
        warnings.push('ไม่พบข้อมูลประเภทการใช้ที่ดิน');
      }

      return {
        extractedData,
        errors,
        warnings,
        validationScore,
        criticalFieldsValid,
      };
    } catch (error) {
      logger.error('Error validating land document:', error);
      return {
        extractedData: {},
        errors: ['เกิดข้อผิดพลาดในการตรวจสอบเอกสารสิทธิ์ที่ดิน'],
        warnings: [],
        validationScore: 0,
        criticalFieldsValid: false,
      };
    }
  }

  /**
   * Extract text using OCR service
   */
  async _extractTextWithOCR(fileBuffer, documentType) {
    try {
      if (!this.ocrService) {
        logger.warn('OCR service not available, using mock extraction');
        return {
          success: true,
          extractedText: 'Mock OCR text for testing purposes',
          confidence: 85,
        };
      }

      const result = await this.ocrService.extractText(fileBuffer, {
        language: 'tha+eng',
        documentType,
        enhanceImage: true,
      });

      return {
        success: result.success,
        extractedText: result.text || '',
        confidence: result.confidence || 0,
      };
    } catch (error) {
      logger.error('OCR extraction failed:', error);
      return {
        success: false,
        extractedText: '',
        confidence: 0,
      };
    }
  }

  /**
   * ตรวจสอบ checksum เลขบัตรประชาชนไทย
   */
  _validateThaiIdChecksum(idNumber) {
    if (!/^.{13}$/.test(idNumber)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(idNumber[i]) * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(idNumber[12]);
  }

  /**
   * Parse date from various formats
   */
  _parseDate(dateString) {
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let [, day, month, year] = match;

        // Convert Buddhist year to Gregorian if needed
        year = parseInt(year);
        if (year > 2500) {
          year -= 543;
        }

        return new Date(year, parseInt(month) - 1, parseInt(day));
      }
    }

    return null;
  }

  /**
   * Calculate overall confidence score
   */
  _calculateOverallConfidence(ocrConfidence, validationScore) {
    return Math.round(ocrConfidence * 0.3 + validationScore * 0.7);
  }

  /**
   * Get default document patterns
   */
  _getDefaultPatterns() {
    return {
      // Define document patterns here
      farmLicense: {
        requiredFields: ['licenseNumber', 'farmerName', 'expiryDate'],
        optionalFields: ['farmType', 'issuingAuthority'],
      },
      idCard: {
        requiredFields: ['idNumber', 'fullName', 'expiryDate'],
        optionalFields: ['birthDate', 'address'],
      },
      landDocument: {
        requiredFields: ['landNumber', 'ownerName', 'location'],
        optionalFields: ['landArea', 'landUse'],
      },
    };
  }
}

module.exports = DocumentContentValidationService;
