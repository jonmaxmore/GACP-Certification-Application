/**
 * Document Analysis Service - Unit Tests
 * Tests the document requirement analysis logic
 */

const DocumentAnalysisService = require('../../services/document-analysis-service');

// Mock the models
jest.mock('../../models/DocumentRequirementModel', () => ({
    getRequirementsForPlant: jest.fn(),
}));

jest.mock('../../models/PlantMasterModel', () => ({
    getPlantById: jest.fn(),
}));

const DocumentRequirement = require('../../models-mongoose-legacy/DocumentRequirement-model');
const PlantMaster = require('../../models-mongoose-legacy/PlantMaster-model');

describe('DocumentAnalysisService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getBaseRequirements', () => {
        it('should return formatted document requirements', async () => {
            // Arrange
            DocumentRequirement.getRequirementsForPlant.mockResolvedValue([
                {
                    _id: { toString: () => 'doc1' },
                    documentName: 'ID Card Copy',
                    documentNameTH: 'สำเนาบัตรประชาชน',
                    category: 'IDENTITY',
                    isRequired: true,
                    description: 'Required for all',
                },
            ]);

            // Act
            const result = await DocumentAnalysisService.getBaseRequirements('CAN', 'NEW');

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: 'doc1',
                slotId: 'id_card_copy',
                name: 'ID Card Copy',
                nameTH: 'สำเนาบัตรประชาชน',
                category: 'IDENTITY',
                isRequired: true,
            });
        });
    });

    describe('analyzeRequiredDocuments', () => {
        beforeEach(() => {
            PlantMaster.getPlantById.mockResolvedValue({
                plantId: 'CAN',
                nameEN: 'Cannabis',
                nameTH: 'กัญชา',
                group: 'HIGH_CONTROL',
            });
            DocumentRequirement.getRequirementsForPlant.mockResolvedValue([]);
        });

        it('should analyze Cannabis NEW application', async () => {
            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'CAN',
                'NEW',
                { licenseInfo: { plantingStatus: 'Permission' } },
            );

            // Assert
            expect(result.plantId).toBe('CAN');
            expect(result.plantGroup).toBe('HIGH_CONTROL');
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'license_copy' }),
                ]),
            );
        });

        it('should add notify receipt for Notify status', async () => {
            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'CAN',
                'NEW',
                { licenseInfo: { plantingStatus: 'Notify' } },
            );

            // Assert
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'notify_receipt' }),
                ]),
            );
        });

        it('should add CCTV plan when hasCCTV is true', async () => {
            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'CAN',
                'NEW',
                {
                    licenseInfo: { plantingStatus: 'Permission' },
                    securityMeasures: { hasCCTV: true },
                },
            );

            // Assert
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'cctv_plan' }),
                ]),
            );
        });

        it('should add police report for Lost replacement', async () => {
            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'CAN',
                'AMEND',
                { replacementReason: 'Lost' },
            );

            // Assert
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'police_report' }),
                ]),
            );
            expect(result.documents).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'damaged_cert_photo' }),
                ]),
            );
        });

        it('should add damaged cert photo for Damaged replacement', async () => {
            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'CAN',
                'AMEND',
                { replacementReason: 'Damaged' },
            );

            // Assert
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'damaged_cert_photo' }),
                ]),
            );
        });

        it('should add arsenic test for tuber-based plants', async () => {
            PlantMaster.getPlantById.mockResolvedValue({
                plantId: 'TUR',
                nameEN: 'Turmeric',
                nameTH: 'ขมิ้นชัน',
                group: 'GENERAL',
            });

            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'TUR',
                'NEW',
                { production: { plantParts: ['Rhizome (เหง้า)'] } },
            );

            // Assert
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'arsenic_test' }),
                ]),
            );
        });

        it('should add import license for Import source type', async () => {
            // Act
            const result = await DocumentAnalysisService.analyzeRequiredDocuments(
                'CAN',
                'NEW',
                {
                    licenseInfo: { plantingStatus: 'Permission' },
                    production: { sourceType: 'Import' },
                },
            );

            // Assert
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'import_license' }),
                ]),
            );
        });

        it('should throw error for invalid plant', async () => {
            PlantMaster.getPlantById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                DocumentAnalysisService.analyzeRequiredDocuments('INVALID', 'NEW', {}),
            ).rejects.toThrow('Plant not found: INVALID');
        });
    });

    describe('validateDocuments', () => {
        it('should return complete when all required docs uploaded', () => {
            const requirements = [
                { slotId: 'id_card', isRequired: true, name: 'ID Card', nameTH: 'บัตร' },
                { slotId: 'land_deed', isRequired: true, name: 'Land', nameTH: 'ที่ดิน' },
                { slotId: 'gap_cert', isRequired: false, name: 'GAP', nameTH: 'GAP' },
            ];
            const uploaded = ['id_card', 'land_deed'];

            const result = DocumentAnalysisService.validateDocuments(uploaded, requirements);

            expect(result.isComplete).toBe(true);
            expect(result.missingDocuments).toHaveLength(0);
        });

        it('should return incomplete with missing docs', () => {
            const requirements = [
                { slotId: 'id_card', isRequired: true, name: 'ID Card', nameTH: 'บัตร' },
                { slotId: 'land_deed', isRequired: true, name: 'Land', nameTH: 'ที่ดิน' },
            ];
            const uploaded = ['id_card'];

            const result = DocumentAnalysisService.validateDocuments(uploaded, requirements);

            expect(result.isComplete).toBe(false);
            expect(result.missingDocuments).toHaveLength(1);
            expect(result.missingDocuments[0].slotId).toBe('land_deed');
        });
    });
});

