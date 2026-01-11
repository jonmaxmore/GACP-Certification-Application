/**
 * Document Analysis Service - Unit Tests
 * Tests the document requirement analysis logic
 */

// 1. Mock Mocks First (before require)
// We use inline definition to avoid hoisting issues with variables.
jest.mock('../../services/prisma-database', () => ({
    prisma: {
        documentRequirement: {
            findMany: jest.fn(),
        },
        plantSpecies: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('../../services/ocr-service', () => ({
    extractText: jest.fn(),
}));

jest.mock('../../services/ai/document-classifier', () => ({
    classify: jest.fn(),
    extractData: jest.fn(),
}));

// 2. Require modules
const DocumentAnalysisService = require('../../services/document-analysis-service');
const { prisma } = require('../../services/prisma-database');
const ocrService = require('../../services/ocr-service');
const documentClassifier = require('../../services/ai/document-classifier');

describe('DocumentAnalysisService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getBaseRequirements', () => {
        it('should return formatted document requirements', async () => {
            // Arrange
            prisma.documentRequirement.findMany.mockResolvedValue([
                {
                    id: 'doc1',
                    documentName: 'ID Card Copy',
                    documentNameTH: 'สำเนาบัตรประชาชน',
                    category: 'IDENTITY',
                    isRequired: true,
                    description: 'Required for all',
                    allowedFileTypes: ['jpg'],
                    maxFileSizeMB: 5,
                    sortOrder: 1,
                },
            ]);

            // Act
            const result = await DocumentAnalysisService.getBaseRequirements('CAN', 'NEW');

            // Assert
            expect(prisma.documentRequirement.findMany).toHaveBeenCalledWith({
                where: {
                    plantCode: 'CAN',
                    requestType: 'NEW',
                },
                orderBy: {
                    sortOrder: 'asc',
                },
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: 'doc1',
                slotId: 'id_card_copy',
                category: 'IDENTITY',
                isRequired: true,
            });
        });
    });

    describe('analyzeRequiredDocuments', () => {
        beforeEach(() => {
            prisma.plantSpecies.findUnique.mockResolvedValue({
                code: 'CAN',
                nameEN: 'Cannabis',
                nameTH: 'กัญชา',
                group: 'HIGH_CONTROL',
            });
            prisma.documentRequirement.findMany.mockResolvedValue([]);
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
            expect(result.documents).toBeDefined();
        });

        it('should include Farm Signage Photo (Evidence)', async () => {
            const result = await DocumentAnalysisService.analyzeRequiredDocuments('CAN', 'NEW', {});
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'farm_banner_photo' }),
                ]),
            );
        });

        it('should include specific docs for Export/Sales', async () => {
            // Logic in service uses these exact objects injected
            const result = await DocumentAnalysisService.analyzeRequiredDocuments('CAN', 'NEW', {});

            // Note: sop_cultivation is optional by default in the service logic (isRequired: false),
            // but it IS included in the returned list.
            expect(result.documents).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ slotId: 'sop_cultivation' }),
                ]),
            );
        });
    });

    describe('verifyUploadedDocument', () => {
        it('should use OCR service to extract text', async () => {
            // Arrange
            const mockFile = 'path/to/doc.pdf';
            ocrService.extractText.mockResolvedValue({
                success: true,
                text: 'Sample Text',
                confidence: 90,
            });

            documentClassifier.classify.mockReturnValue({ valid: true, confidence: 0.9, confidencePercent: 90 });
            documentClassifier.extractData.mockReturnValue({ id: '123' });

            // Act
            const result = await DocumentAnalysisService.verifyUploadedDocument(mockFile, 'ID_CARD');

            // Assert
            expect(ocrService.extractText).toHaveBeenCalledWith(mockFile);
            expect(result.valid).toBe(true);
            expect(result.confidencePercent).toBe(90);
        });
    });
});
