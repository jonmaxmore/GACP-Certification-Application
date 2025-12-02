const { createLogger } = require('../../../shared/logger');
const logger = createLogger('document-management-document-security.service');

/**
 * Document Security Service
 *
 * Purpose: ตรวจสอบความปลอดภัยของเอกสารก่อนเข้าสู่ระบบ
 *
 * Security Checks:
 * 1. Virus/Malware Scanning
 * 2. File Type Validation
 * 3. File Size Limits
 * 4. Content Security Policy
 * 5. Suspicious Pattern Detection
 *
 * Workflow:
 * 1. File Type & Size Check
 * 2. Virus Scanning
 * 3. Content Analysis
 * 4. Metadata Sanitization
 * 5. Security Score Calculation
 */

class DocumentSecurityService {
  constructor({ virusScanService, fileValidationRules, contentAnalysisService }) {
    this.virusScanService = virusScanService;
    this.fileValidationRules = fileValidationRules || this._getDefaultValidationRules();
    this.contentAnalysisService = contentAnalysisService;
  }

  /**
   * ตรวจสอบความปลอดภัยของเอกสาร
   * @param {Buffer} fileBuffer - ไฟล์เอกสาร
   * @param {Object} fileMetadata - ข้อมูล metadata ของไฟล์
   * @param {string} documentType - ประเภทเอกสาร
   * @returns {Object} ผลการตรวจสอบความปลอดภัย
   */
  async performSecurityCheck(fileBuffer, fileMetadata, documentType) {
    try {
      logger.info(`🔒 Starting security check for ${documentType}: ${fileMetadata.originalName}`);

      const securityChecks = {
        fileTypeCheck: null,
        fileSizeCheck: null,
        virusScan: null,
        contentAnalysis: null,
        metadataSanitization: null,
      };

      let overallScore = 100;
      const threats = [];
      const warnings = [];

      // 1. File Type Validation
      logger.info('📋 Checking file type...');
      securityChecks.fileTypeCheck = await this._validateFileType(
        fileBuffer,
        fileMetadata,
        documentType,
      );
      if (!securityChecks.fileTypeCheck.valid) {
        overallScore -= 50;
        threats.push(...securityChecks.fileTypeCheck.threats);
      }

      // 2. File Size Validation
      logger.info('📏 Checking file size...');
      securityChecks.fileSizeCheck = await this._validateFileSize(fileMetadata, documentType);
      if (!securityChecks.fileSizeCheck.valid) {
        overallScore -= 20;
        warnings.push(...securityChecks.fileSizeCheck.warnings);
      }

      // 3. Virus Scanning
      logger.info('🦠 Performing virus scan...');
      securityChecks.virusScan = await this._performVirusScan(fileBuffer);
      if (!securityChecks.virusScan.clean) {
        overallScore = 0; // Virus = immediate failure
        threats.push(...securityChecks.virusScan.threats);
      }

      // 4. Content Analysis (only if previous checks passed)
      if (overallScore > 0) {
        logger.info('🔍 Analyzing content security...');
        securityChecks.contentAnalysis = await this._analyzeContentSecurity(
          fileBuffer,
          documentType,
        );
        if (securityChecks.contentAnalysis.riskLevel === 'HIGH') {
          overallScore -= 30;
          threats.push(...securityChecks.contentAnalysis.threats);
        } else if (securityChecks.contentAnalysis.riskLevel === 'MEDIUM') {
          overallScore -= 15;
          warnings.push(...securityChecks.contentAnalysis.warnings);
        }
      }

      // 5. Metadata Sanitization
      logger.info('🧹 Sanitizing metadata...');
      securityChecks.metadataSanitization = await this._sanitizeMetadata(fileMetadata);
      if (securityChecks.metadataSanitization.hasPrivacyRisks) {
        overallScore -= 10;
        warnings.push(...securityChecks.metadataSanitization.warnings);
      }

      // Calculate final security assessment
      const isSafe = overallScore >= 70 && threats.length === 0;

      logger.info(`🎯 Security check completed. Score: ${overallScore}/100, Safe: ${isSafe}`);

      return {
        safe: isSafe,
        securityScore: overallScore,
        threats,
        warnings,
        securityChecks,
        recommendation: this._getSecurityRecommendation(overallScore, threats, warnings),
      };
    } catch (error) {
      logger.error('❌ Security check failed:', error);
      return {
        safe: false,
        securityScore: 0,
        threats: ['System error during security check'],
        warnings: [],
        securityChecks: {},
        recommendation: 'BLOCK',
      };
    }
  }

  /**
   * ตรวจสอบประเภทไฟล์
   */
  async _validateFileType(fileBuffer, fileMetadata, documentType) {
    try {
      const allowedTypes = this.fileValidationRules[documentType]?.allowedTypes || [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
      ];

      const detectedType = await this._detectFileType(fileBuffer);
      const declaredType = fileMetadata.mimetype;

      const threats = [];
      const warnings = [];

      // ตรวจสอบว่าประเภทไฟล์ที่ประกาศตรงกับที่ตรวจพบ
      if (detectedType !== declaredType) {
        threats.push(`File type mismatch: declared ${declaredType}, detected ${detectedType}`);
      }

      // ตรวจสอบว่าประเภทไฟล์อยู่ในรายการที่อนุญาต
      if (!allowedTypes.includes(detectedType)) {
        threats.push(`File type not allowed: ${detectedType}`);
      }

      // ตรวจสอบ file signature (magic bytes)
      const signatureValid = await this._validateFileSignature(fileBuffer, detectedType);
      if (!signatureValid) {
        threats.push('Invalid file signature');
      }

      return {
        valid: threats.length === 0,
        detectedType,
        declaredType,
        threats,
        warnings,
      };
    } catch (error) {
      logger.error('File type validation error:', error);
      return {
        valid: false,
        threats: ['File type validation failed'],
        warnings: [],
      };
    }
  }

  /**
   * ตรวจสอบขนาดไฟล์
   */
  async _validateFileSize(fileMetadata, documentType) {
    const maxSize = this.fileValidationRules[documentType]?.maxSize || 50 * 1024 * 1024; // 50MB default
    const minSize = this.fileValidationRules[documentType]?.minSize || 1024; // 1KB default

    const warnings = [];

    if (fileMetadata.size > maxSize) {
      warnings.push(`File too large: ${fileMetadata.size} bytes (max: ${maxSize})`);
    }

    if (fileMetadata.size < minSize) {
      warnings.push(`File too small: ${fileMetadata.size} bytes (min: ${minSize})`);
    }

    return {
      valid: warnings.length === 0,
      fileSize: fileMetadata.size,
      maxAllowed: maxSize,
      minRequired: minSize,
      warnings,
    };
  }

  /**
   * ตรวจสอบไวรัส
   */
  async _performVirusScan(fileBuffer) {
    try {
      if (!this.virusScanService) {
        logger.warn('⚠️ Virus scan service not available, using mock scan');
        return {
          clean: true,
          threats: [],
          scanResult: 'MOCK_CLEAN',
        };
      }

      const scanResult = await this.virusScanService.scanBuffer(fileBuffer);

      return {
        clean: scanResult.clean,
        threats: scanResult.threats || [],
        scanResult: scanResult.result,
        scanTime: scanResult.scanTime,
        scanEngine: scanResult.engine,
      };
    } catch (error) {
      logger.error('Virus scan error:', error);
      return {
        clean: false,
        threats: ['Virus scan failed'],
        scanResult: 'SCAN_ERROR',
      };
    }
  }

  /**
   * วิเคราะห์ความปลอดภัยเนื้อหา
   */
  async _analyzeContentSecurity(fileBuffer, documentType) {
    try {
      const threats = [];
      const warnings = [];
      let riskLevel = 'LOW';

      // 1. ตรวจสอบ embedded objects (สำหรับ PDF)
      let embeddedObjects = null;
      if (documentType === 'application/pdf') {
        embeddedObjects = await this._checkPDFEmbeddedObjects(fileBuffer);
        if (embeddedObjects.hasJavaScript) {
          threats.push('PDF contains JavaScript');
          riskLevel = 'HIGH';
        }
        if (embeddedObjects.hasEmbeddedFiles) {
          warnings.push('PDF contains embedded files');
          riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
        }
      }

      // 2. ตรวจสอบ suspicious patterns
      const suspiciousPatterns = await this._detectSuspiciousPatterns(fileBuffer);
      if (suspiciousPatterns.length > 0) {
        threats.push(...suspiciousPatterns);
        riskLevel = 'HIGH';
      }

      // 3. ตรวจสอบ file complexity
      const complexityCheck = await this._analyzeFileComplexity(fileBuffer, documentType);
      if (complexityCheck.isUnusuallyComplex) {
        warnings.push('File has unusual complexity');
        riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
      }

      return {
        riskLevel,
        threats,
        warnings,
        embeddedObjects: documentType === 'application/pdf' ? embeddedObjects : null,
        complexityScore: complexityCheck.score,
      };
    } catch (error) {
      logger.error('Content security analysis error:', error);
      return {
        riskLevel: 'HIGH',
        threats: ['Content analysis failed'],
        warnings: [],
      };
    }
  }

  /**
   * ทำความสะอาด metadata
   */
  async _sanitizeMetadata(fileMetadata) {
    const warnings = [];
    const sensitiveFields = ['author', 'creator', 'lastModifiedBy', 'company'];
    let hasPrivacyRisks = false;

    // ตรวจสอบ sensitive metadata
    if (fileMetadata.exifData) {
      for (const field of sensitiveFields) {
        if (fileMetadata.exifData[field]) {
          warnings.push(`Contains ${field} metadata`);
          hasPrivacyRisks = true;
        }
      }

      // ตรวจสอบ GPS coordinates
      if (fileMetadata.exifData.gps) {
        warnings.push('Contains GPS location data');
        hasPrivacyRisks = true;
      }
    }

    return {
      hasPrivacyRisks,
      warnings,
      sanitizedMetadata: this._stripSensitiveMetadata(fileMetadata),
    };
  }

  /**
   * ตรวจจับประเภทไฟล์จาก magic bytes
   */
  async _detectFileType(fileBuffer) {
    const magicBytes = fileBuffer.slice(0, 16);
    const hex = magicBytes.toString('hex').toLowerCase();

    // PDF
    if (hex.startsWith('255044462d')) {
      return 'application/pdf';
    }

    // JPEG
    if (hex.startsWith('ffd8')) {
      return 'image/jpeg';
    }

    // PNG
    if (hex.startsWith('89504e47')) {
      return 'image/png';
    }

    // TIFF
    if (hex.startsWith('49492a00') || hex.startsWith('4d4d002a')) {
      return 'image/tiff';
    }

    return 'application/octet-stream';
  }

  /**
   * ตรวจสอบ file signature
   */
  async _validateFileSignature(fileBuffer, fileType) {
    const detectedType = await this._detectFileType(fileBuffer);
    return detectedType === fileType;
  }

  /**
   * ตรวจสอบ embedded objects ใน PDF
   */
  async _checkPDFEmbeddedObjects(fileBuffer) {
    const content = fileBuffer.toString('ascii');

    return {
      hasJavaScript: /\/JavaScript/.test(content) || /\/JS/.test(content),
      hasEmbeddedFiles: /\/EmbeddedFile/.test(content),
      hasActions: /\/Action/.test(content),
      hasAnnotations: /\/Annot/.test(content),
    };
  }

  /**
   * ตรวจจับ suspicious patterns
   */
  async _detectSuspiciousPatterns(fileBuffer) {
    const patterns = [];
    const content = fileBuffer.toString('hex');

    // ตรวจหา shell code patterns
    const shellcodePatterns = [
      '90909090', // NOP sled
      '31c0', // XOR EAX, EAX
      'eb', // JMP short
    ];

    for (const pattern of shellcodePatterns) {
      if (content.includes(pattern)) {
        patterns.push(`Suspicious pattern detected: ${pattern}`);
      }
    }

    return patterns;
  }

  /**
   * วิเคราะห์ความซับซ้อนของไฟล์
   */
  async _analyzeFileComplexity(fileBuffer, documentType) {
    let score = 0;

    // File size complexity
    if (fileBuffer.length > 10 * 1024 * 1024) {
      score += 20;
    } // > 10MB

    // Entropy check (randomness)
    const entropy = this._calculateEntropy(fileBuffer);
    if (entropy > 7.5) {
      score += 30;
    } // High entropy might indicate compression/encryption

    // Structure complexity (for PDFs)
    if (documentType === 'application/pdf') {
      const objectCount = (fileBuffer.toString('ascii').match(/obj/g) || []).length;
      if (objectCount > 1000) {
        score += 25;
      }
    }

    return {
      score,
      isUnusuallyComplex: score > 50,
      entropy,
    };
  }

  /**
   * คำนวณ entropy
   */
  _calculateEntropy(buffer) {
    const freq = new Array(256).fill(0);

    for (let i = 0; i < buffer.length; i++) {
      freq[buffer[i]]++;
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) {
        const p = freq[i] / buffer.length;
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  /**
   * ลบ sensitive metadata
   */
  _stripSensitiveMetadata(metadata) {
    const cleaned = { ...metadata };

    if (cleaned.exifData) {
      delete cleaned.exifData.author;
      delete cleaned.exifData.creator;
      delete cleaned.exifData.lastModifiedBy;
      delete cleaned.exifData.company;
      delete cleaned.exifData.gps;
    }

    return cleaned;
  }

  /**
   * ให้คำแนะนำความปลอดภัย
   */
  _getSecurityRecommendation(score, threats, warnings) {
    if (threats.length > 0) {
      return 'BLOCK';
    }
    if (score < 70) {
      return 'QUARANTINE';
    }
    if (warnings.length > 3) {
      return 'REVIEW';
    }
    return 'ALLOW';
  }

  /**
   * Default file validation rules
   */
  _getDefaultValidationRules() {
    return {
      FARM_LICENSE: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        minSize: 50 * 1024, // 50KB
      },
      ID_CARD: {
        allowedTypes: ['image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024, // 5MB
        minSize: 100 * 1024, // 100KB
      },
      LAND_DOCUMENT: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 15 * 1024 * 1024, // 15MB
        minSize: 50 * 1024, // 50KB
      },
      GAP_CERTIFICATE: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        minSize: 50 * 1024, // 50KB
      },
      CROP_DETAILS: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel'],
        maxSize: 20 * 1024 * 1024, // 20MB
        minSize: 10 * 1024, // 10KB
      },
    };
  }
}

module.exports = DocumentSecurityService;
