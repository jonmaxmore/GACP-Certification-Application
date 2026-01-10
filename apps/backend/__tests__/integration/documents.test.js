/**
 * Unit Tests for Documents/Files API
 * Tests file upload, download, and security features
 */

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock the documents router
jest.mock('../../middleware/AuthMiddleware', () => ({
    authenticateFarmer: (req, res, next) => {
        req.user = { id: 'test-user-123', role: 'FARMER' };
        next();
    },
}));

const documentsRouter = require('../../routes/api/documents');

describe('Documents API', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v2/files', documentsRouter);
    });

    describe('POST /api/v2/files/upload', () => {
        it('should reject request without file', async () => {
            const response = await request(app)
                .post('/api/v2/files/upload')
                .set('Content-Type', 'multipart/form-data');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('ไฟล์');
        });

        it('should reject unsupported file types', async () => {
            const testFilePath = path.join(__dirname, 'test-file.exe');
            fs.writeFileSync(testFilePath, 'test content');

            try {
                const response = await request(app)
                    .post('/api/v2/files/upload')
                    .attach('file', testFilePath);

                expect(response.status).toBe(400);
            } finally {
                if (fs.existsSync(testFilePath)) {
                    fs.unlinkSync(testFilePath);
                }
            }
        });
    });

    describe('GET /api/v2/files/:id', () => {
        it('should return 400 for invalid ID format', async () => {
            const response = await request(app)
                .get('/api/v2/files/invalid-id');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('ID');
        });

        it('should return 404 for non-existent document', async () => {
            const validId = 'a'.repeat(32);
            const response = await request(app)
                .get(`/api/v2/files/${validId}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('ไม่พบ');
        });
    });

    describe('DELETE /api/v2/files/:id', () => {
        it('should return 400 for invalid ID format', async () => {
            const response = await request(app)
                .delete('/api/v2/files/invalid');

            expect(response.status).toBe(400);
        });

        it('should return 404 for non-existent document', async () => {
            const validId = 'b'.repeat(32);
            const response = await request(app)
                .delete(`/api/v2/files/${validId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('Rate Limiting', () => {
        it('should allow requests within limit', async () => {
            const responses = [];
            for (let i = 0; i < 5; i++) {
                const res = await request(app)
                    .get('/api/v2/files/application/test-app');
                responses.push(res);
            }

            // All should succeed (not rate limited)
            responses.forEach(res => {
                expect(res.status).not.toBe(429);
            });
        });
    });
});

describe('Input Sanitization', () => {
    it('should sanitize filenames with path traversal attempts', () => {
        // Test the sanitization logic
        const sanitizeFilename = (filename) => {
            if (!filename) { return 'document'; }
            let sanitized = filename.replace(/\.\./g, '');
            // eslint-disable-next-line no-control-regex
            sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
            sanitized = sanitized.substring(0, 200);
            return sanitized || 'document';
        };

        expect(sanitizeFilename('../../../etc/passwd')).toBe('etc_passwd');
        expect(sanitizeFilename('file<script>.pdf')).toBe('file_script_.pdf');
        expect(sanitizeFilename('normal-file.pdf')).toBe('normal-file.pdf');
        expect(sanitizeFilename('')).toBe('document');
        expect(sanitizeFilename(null)).toBe('document');
    });
});

describe('Magic Bytes Validation', () => {
    it('should validate PDF magic bytes', () => {
        const MAGIC_BYTES = {
            'application/pdf': [0x25, 0x50, 0x44, 0x46],
        };

        const validateMagicBytes = (buffer, mimeType) => {
            const expected = MAGIC_BYTES[mimeType];
            if (!expected) { return true; }
            for (let i = 0; i < expected.length; i++) {
                if (buffer[i] !== expected[i]) { return false; }
            }
            return true;
        };

        // Valid PDF header
        const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]);
        expect(validateMagicBytes(validPdf, 'application/pdf')).toBe(true);

        // Invalid PDF (actually an EXE)
        const invalidPdf = Buffer.from([0x4D, 0x5A, 0x00, 0x00]);
        expect(validateMagicBytes(invalidPdf, 'application/pdf')).toBe(false);

        // Unknown type passes through
        expect(validateMagicBytes(invalidPdf, 'unknown/type')).toBe(true);
    });
});

