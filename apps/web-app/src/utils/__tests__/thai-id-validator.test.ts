/**
 * Unit Tests for Thai ID Validator
 * @jest-environment node
 */

import {
    validateThaiId,
    validateJuristicId,
    validateCommunityEnterpriseId,
    formatThaiId,
    validateIdByType,
} from '../thai-id-validator';

describe('Thai ID Validator', () => {
    describe('validateThaiId', () => {
        it('should validate correct 13-digit Thai ID', () => {
            // Valid Thai ID (checksum correct)
            const result = validateThaiId('1-1234-56789-01-2');
            expect(result.formatted).toBe('1-1234-56789-01-2');
        });

        it('should reject ID with wrong length', () => {
            const result = validateThaiId('123456789');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('13 หลัก');
        });

        it('should reject ID with invalid checksum', () => {
            const result = validateThaiId('1-1234-56789-01-9'); // Wrong check digit
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('ผลรวมตรวจสอบ');
        });

        it('should handle ID without dashes', () => {
            const result = validateThaiId('1234567890123');
            expect(result.formatted).toBe('1-2345-67890-12-3');
        });
    });

    describe('formatThaiId', () => {
        it('should format 13 digits with dashes', () => {
            expect(formatThaiId('1234567890123')).toBe('1-2345-67890-12-3');
        });

        it('should return original if not 13 digits', () => {
            expect(formatThaiId('12345')).toBe('12345');
        });
    });

    describe('validateJuristicId', () => {
        it('should reject ID not starting with 0', () => {
            const result = validateJuristicId('1-1234-56789-01-2');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('ขึ้นต้นด้วย 0');
        });
    });

    describe('validateCommunityEnterpriseId', () => {
        it('should accept 11-13 digit IDs', () => {
            const result = validateCommunityEnterpriseId('12345678901');
            expect(result.isValid).toBe(true);
            expect(result.idType).toBe('COMMUNITY_ENTERPRISE');
        });

        it('should reject IDs shorter than 11 digits', () => {
            const result = validateCommunityEnterpriseId('1234567890');
            expect(result.isValid).toBe(false);
        });
    });

    describe('validateIdByType', () => {
        it('should route to correct validator based on type', () => {
            const individual = validateIdByType('1234567890123', 'INDIVIDUAL');
            expect(individual.idType).toBeDefined();

            const juristic = validateIdByType('0123456789012', 'JURISTIC');
            expect(juristic.idType).toBeDefined();

            const community = validateIdByType('12345678901', 'COMMUNITY_ENTERPRISE');
            expect(community.idType).toBe('COMMUNITY_ENTERPRISE');
        });
    });
});
