
const documentClassifier = require('../../services/ai/document-classifier');

describe('Document Classifier - Land Title Extraction', () => {

    test('should extract area from standard Thai text format', () => {
        const text = 'โฉนดเลขที่ 12345 หน้าสำรวจ 6789 เนื้อที่ 5 ไร่ 2 งาน 30 ตารางวา ตำบล...';
        const data = documentClassifier.extractData(text, 'LAND_TITLE');

        expect(data.area).toEqual({
            rai: 5,
            ngan: 2,
            sqWa: 30,
        });
    });

    test('should extract area with missing Ngan/SqWa', () => {
        const text = 'เนื้อที่ 10 ไร่ ตารางวา'; // Edge case
        const data = documentClassifier.extractData(text, 'LAND_TITLE');
        // Regex might capture undefined for missing groups
        expect(data.area.rai).toBe(10);
    });

    test('should extract area from short dashed format', () => {
        const text = 'รายการจดทะเบียน ... เนื้อที่ 5-2-30.5 ...';
        const data = documentClassifier.extractData(text, 'LAND_TITLE');

        expect(data.area).toEqual({
            rai: 5,
            ngan: 2,
            sqWa: 30.5,
        });
    });
});
