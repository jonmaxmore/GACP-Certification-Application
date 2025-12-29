/**
 * Unit Tests for Document Slots
 * Tests for document slot logic and requirements
 */

const {
    DOCUMENT_SLOTS,
    getRequiredSlots,
    getAllSlotIds,
    requiresLicense,
    getRequiredDocuments
} = require('../constants/document-slots');

describe('Document Slots', () => {

    describe('DOCUMENT_SLOTS structure', () => {

        test('should have required fields for each slot', () => {
            Object.values(DOCUMENT_SLOTS).forEach(slot => {
                expect(slot).toHaveProperty('slotId');
                expect(slot).toHaveProperty('name');
                expect(slot).toHaveProperty('description');
                expect(slot).toHaveProperty('required');
            });
        });

        test('should have unique slot IDs', () => {
            const slotIds = Object.values(DOCUMENT_SLOTS).map(s => s.slotId);
            const uniqueIds = [...new Set(slotIds)];
            expect(slotIds.length).toBe(uniqueIds.length);
        });

        test('should have photo category slots', () => {
            const photoSlots = ['photos_exterior', 'photos_interior', 'photos_storage', 'photos_signage'];
            photoSlots.forEach(slotId => {
                const slot = Object.values(DOCUMENT_SLOTS).find(s => s.slotId === slotId);
                expect(slot).toBeDefined();
            });
        });

        test('should have DTAM required documents', () => {
            const dtamRequired = ['criminal_bg', 'land_consent', 'gov_support'];
            dtamRequired.forEach(slotId => {
                const slot = Object.values(DOCUMENT_SLOTS).find(s => s.slotId === slotId);
                expect(slot).toBeDefined();
            });
        });

        test('should have renewal documents', () => {
            const renewalDocs = ['renewal_report', 'previous_cert'];
            renewalDocs.forEach(slotId => {
                const slot = Object.values(DOCUMENT_SLOTS).find(s => s.slotId === slotId);
                expect(slot).toBeDefined();
                expect(slot.requiredFor.applicationTypes).toContain('RENEWAL');
            });
        });

    });

    describe('getRequiredSlots', () => {

        test('should return required slots for general plant type', () => {
            const slots = getRequiredSlots('general');
            expect(Array.isArray(slots)).toBe(true);
            expect(slots.every(s => s.required === true)).toBe(true);
        });

        test('should return slots for cannabis including license requirement', () => {
            const slots = getRequiredSlots('cannabis');
            const hasBt11 = slots.some(s => s.slotId === 'license_bt11');
            expect(hasBt11).toBe(true);
        });

    });

    describe('getAllSlotIds', () => {

        test('should return array of slot IDs', () => {
            const ids = getAllSlotIds();
            expect(Array.isArray(ids)).toBe(true);
            expect(ids.length).toBeGreaterThan(0);
            expect(ids.every(id => typeof id === 'string')).toBe(true);
        });

    });

    describe('requiresLicense', () => {

        test('should return true for cannabis', () => {
            expect(requiresLicense('cannabis')).toBe(true);
            expect(requiresLicense('Cannabis')).toBe(true);
            expect(requiresLicense('CANNABIS')).toBe(true);
        });

        test('should return true for kratom', () => {
            expect(requiresLicense('kratom')).toBe(true);
        });

        test('should return false for other plants', () => {
            expect(requiresLicense('turmeric')).toBe(false);
            expect(requiresLicense('ginger')).toBe(false);
            expect(requiresLicense('general')).toBe(false);
        });

    });

    describe('getRequiredDocuments', () => {

        test('should return array of required documents', () => {
            const docs = getRequiredDocuments({
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL'
            });
            expect(Array.isArray(docs)).toBe(true);
        });

        test('should include BT.11 for cannabis', () => {
            const docs = getRequiredDocuments({
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL'
            });
            const hasBt11 = docs.some(d => d.slotId === 'license_bt11');
            expect(hasBt11).toBe(true);
        });

        test('should include BT.13 when PROCESSING objective', () => {
            const docs = getRequiredDocuments({
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL',
                objectives: ['PROCESSING']
            });
            const hasBt13 = docs.some(d => d.slotId === 'license_bt13');
            expect(hasBt13).toBe(true);
        });

        test('should include company_reg for JURISTIC applicant', () => {
            const docs = getRequiredDocuments({
                plantType: 'cannabis',
                applicantType: 'JURISTIC'
            });
            const hasCompanyReg = docs.some(d => d.slotId === 'company_reg');
            expect(hasCompanyReg).toBe(true);
        });

        test('should include land_consent for permitted_use ownership', () => {
            const docs = getRequiredDocuments({
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL',
                landOwnership: 'permitted_use'
            });
            const hasLandConsent = docs.some(d => d.slotId === 'land_consent');
            expect(hasLandConsent).toBe(true);
        });

    });

});
