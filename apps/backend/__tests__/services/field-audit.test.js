/**
 * Field Audit Service Tests
 * Tests for audit creation, scoring, and 3-strikes logic
 */

const FieldAuditService = require('../../services/FieldAuditService');

describe('FieldAuditService', () => {
    describe('Score Calculation', () => {
        it('should calculate score correctly for all PASS responses', () => {
            const responses = [
                { itemCode: 'A01', response: 'PASS' },
                { itemCode: 'A02', response: 'PASS' },
                { itemCode: 'A03', response: 'PASS' },
                { itemCode: 'A04', response: 'PASS' },
                { itemCode: 'A05', response: 'PASS' },
            ];

            const score = FieldAuditService.calculateCategoryScore(responses);
            expect(score).toBe(100);
        });

        it('should calculate score correctly with some FAIL responses', () => {
            const responses = [
                { itemCode: 'A01', response: 'PASS' },
                { itemCode: 'A02', response: 'PASS' },
                { itemCode: 'A03', response: 'PASS' },
                { itemCode: 'A04', response: 'PASS' },
                { itemCode: 'A05', response: 'FAIL' },
            ];

            const score = FieldAuditService.calculateCategoryScore(responses);
            expect(score).toBe(80);
        });

        it('should exclude NA responses from calculation', () => {
            const responses = [
                { itemCode: 'A01', response: 'PASS' },
                { itemCode: 'A02', response: 'PASS' },
                { itemCode: 'A03', response: 'NA' },
                { itemCode: 'A04', response: 'NA' },
                { itemCode: 'A05', response: 'FAIL' },
            ];

            // 2 PASS, 1 FAIL, 2 NA -> 2/3 = 66.67%
            const score = FieldAuditService.calculateCategoryScore(responses);
            expect(score).toBeCloseTo(66.67, 1);
        });
    });

    describe('Pass Threshold', () => {
        it('should pass if score >= 90%', () => {
            const isPass = FieldAuditService.isPassingScore(90);
            expect(isPass).toBe(true);
        });

        it('should fail if score < 90%', () => {
            const isPass = FieldAuditService.isPassingScore(89.9);
            expect(isPass).toBe(false);
        });
    });

    describe('3-Strikes Logic', () => {
        it('should count major fails correctly', () => {
            const responses = [
                { itemCode: 'MAJOR01', response: 'FAIL', isCritical: true },
                { itemCode: 'MINOR01', response: 'FAIL', isCritical: false },
                { itemCode: 'MAJOR02', response: 'FAIL', isCritical: true },
            ];

            const majorFails = FieldAuditService.countMajorFails(responses);
            expect(majorFails).toBe(2);
        });

        it('should trigger auto-cancel after 3 major fails', () => {
            const responses = [
                { itemCode: 'MAJOR01', response: 'FAIL', isCritical: true },
                { itemCode: 'MAJOR02', response: 'FAIL', isCritical: true },
                { itemCode: 'MAJOR03', response: 'FAIL', isCritical: true },
            ];

            const shouldCancel = FieldAuditService.shouldAutoCancel(responses);
            expect(shouldCancel).toBe(true);
        });

        it('should not auto-cancel with less than 3 major fails', () => {
            const responses = [
                { itemCode: 'MAJOR01', response: 'FAIL', isCritical: true },
                { itemCode: 'MAJOR02', response: 'FAIL', isCritical: true },
                { itemCode: 'MINOR01', response: 'FAIL', isCritical: false },
            ];

            const shouldCancel = FieldAuditService.shouldAutoCancel(responses);
            expect(shouldCancel).toBe(false);
        });
    });

    describe('Audit Number Generation', () => {
        it('should generate valid audit number format', () => {
            // Format: FA-YYYY-NNNNNN
            const number = FieldAuditService.generateAuditNumber();

            expect(number).toMatch(/^FA-\d{4}-\d{6}$/);
        });

        it('should include current year', () => {
            const currentYear = new Date().getFullYear();
            const number = FieldAuditService.generateAuditNumber();

            expect(number).toContain(currentYear.toString());
        });
    });
});

describe('PhotoUploadService', () => {
    const PhotoUploadService = require('../../services/media/PhotoUploadService');

    describe('GPS Validation', () => {
        it('should accept valid Thailand coordinates', () => {
            // Bangkok
            const isValid = PhotoUploadService.validateGPS(13.7563, 100.5018);
            expect(isValid).toBe(true);
        });

        it('should accept Chiang Mai coordinates', () => {
            const isValid = PhotoUploadService.validateGPS(18.7883, 98.9853);
            expect(isValid).toBe(true);
        });

        it('should reject coordinates outside Thailand', () => {
            // Tokyo
            const isValid = PhotoUploadService.validateGPS(35.6762, 139.6503);
            expect(isValid).toBe(false);
        });

        it('should reject invalid coordinates', () => {
            const isValid = PhotoUploadService.validateGPS('invalid', 100);
            expect(isValid).toBe(false);
        });
    });

    describe('Distance Calculation', () => {
        it('should calculate distance correctly', () => {
            // Bangkok to Chiang Mai ~582km (straight line)
            const distance = PhotoUploadService.calculateDistance(
                13.7563, 100.5018, // Bangkok
                18.7883, 98.9853,   // Chiang Mai
            );

            expect(distance).toBeGreaterThan(580000);
            expect(distance).toBeLessThan(590000);
        });

        it('should return 0 for same location', () => {
            const distance = PhotoUploadService.calculateDistance(
                13.7563, 100.5018,
                13.7563, 100.5018,
            );

            expect(distance).toBe(0);
        });
    });
});

describe('SignatureService', () => {
    const SignatureService = require('../../services/media/SignatureService');

    describe('Signature Validation', () => {
        it('should accept valid base64 signature', () => {
            // Valid base64 image (>100 bytes)
            const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk' +
                'Y'.repeat(200); // Pad to make it > 100 bytes

            const isValid = SignatureService.validateSignatureData(validBase64);
            expect(isValid).toBe(true);
        });

        it('should reject empty signature', () => {
            const isValid = SignatureService.validateSignatureData('');
            expect(isValid).toBe(false);
        });

        it('should reject null signature', () => {
            const isValid = SignatureService.validateSignatureData(null);
            expect(isValid).toBe(false);
        });

        it('should accept data URL format', () => {
            const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAA' +
                'Y'.repeat(200);

            const isValid = SignatureService.validateSignatureData(dataUrl);
            expect(isValid).toBe(true);
        });
    });
});

