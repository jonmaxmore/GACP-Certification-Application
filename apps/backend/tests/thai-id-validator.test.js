/**
 * Unit Tests for Thai ID Validator
 * Tests based on official Ministry of Interior algorithm
 */

const {
    validateThaiId,
    formatThaiId,
    maskThaiId,
    getProvinceCode,
    getProvinceName
} = require('../utils/thai-id-validator');

describe('Thai ID Validator', () => {

    describe('validateThaiId', () => {

        test('should reject ID with wrong length', () => {
            const result = validateThaiId('123456789');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('เลขบัตรประชาชนต้องมี 13 หลัก');
        });

        test('should reject ID with non-numeric characters', () => {
            const result = validateThaiId('1234567890ABC');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น');
        });

        test('should reject ID starting with 0', () => {
            const result = validateThaiId('0234567890123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('หลักแรกไม่สามารถเป็น 0 ได้');
        });

        test('should reject ID starting with 9', () => {
            const result = validateThaiId('9234567890123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('หลักแรกไม่สามารถเป็น 9 ได้ (สำหรับบุคคลต่างด้าว)');
        });

        test('should reject ID with invalid checksum', () => {
            const result = validateThaiId('1234567890120');
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('ไม่ถูกต้อง');
        });

        test('should accept valid ID (test with known valid checksum)', () => {
            // Thai ID: 1-1019-00000-00-1 (test pattern)
            // Using algorithm: sum = 1*13 + 1*12 + 0*11 + 1*10 + 9*9 + 0*8 + 0*7 + 0*6 + 0*5 + 0*4 + 0*3 + 0*2 = 116
            // checkDigit = (11 - 116%11) % 10 = (11 - 6) % 10 = 5
            const validId = '1101900000005';
            const result = validateThaiId(validId);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should handle ID with dashes', () => {
            const result = validateThaiId('1-1019-00000-00-5');
            expect(result.valid).toBe(true);
        });

        test('should handle ID with spaces', () => {
            const result = validateThaiId('1 1019 00000 00 5');
            expect(result.valid).toBe(true);
        });

    });

    describe('formatThaiId', () => {

        test('should format 13-digit ID correctly', () => {
            const formatted = formatThaiId('1101900000005');
            expect(formatted).toBe('1-1019-00000-00-5');
        });

        test('should return original if not 13 digits', () => {
            const formatted = formatThaiId('12345');
            expect(formatted).toBe('12345');
        });

    });

    describe('maskThaiId', () => {

        test('should mask ID showing only first and last digit', () => {
            const masked = maskThaiId('1101900000005');
            expect(masked).toBe('1-****-*****-**-5');
        });

        test('should return *** for invalid length', () => {
            const masked = maskThaiId('12345');
            expect(masked).toBe('***');
        });

    });

    describe('getProvinceCode', () => {

        test('should extract first 2 digits as province code', () => {
            const code = getProvinceCode('1101900000005');
            expect(code).toBe('11');
        });

        test('should return null for invalid ID', () => {
            const code = getProvinceCode('123');
            expect(code).toBeNull();
        });

    });

    describe('getProvinceName', () => {

        test('should return province name for known code', () => {
            // ID starting with '10' = Bangkok
            const name = getProvinceName('1001900000005');
            expect(name).toBe('กรุงเทพมหานคร');
        });

        test('should return unknown message for unknown code', () => {
            // ID starting with '99' (unknown)
            const name = getProvinceName('9901900000000');
            expect(name).toBe('ไม่ทราบจังหวัด');
        });

    });

});
