/**
 * Public Certificate Verification Routes
 * No authentication required - for public QR code scanning
 */

const express = require('express');
const router = express.Router();
const GACPCertificateService = require('../../services/GacpCertificate');

/**
 * @route GET /api/v2/public/verify/:certificateNumber
 * @desc Public certificate verification
 * @access Public (no auth required)
 */
router.get('/verify/:certificateNumber', async (req, res) => {
    try {
        const { certificateNumber } = req.params;
        const { code } = req.query;

        if (!certificateNumber) {
            return res.status(400).json({
                success: false,
                message: 'Certificate number is required',
            });
        }

        const result = await GACPCertificateService.verifyCertificate(certificateNumber, code);

        // Return public verification result
        return res.json({
            success: true,
            verified: result.valid,
            data: {
                certificateNumber,
                status: result.status,
                reason: result.reason || null,
                certificate: result.certificate
                    ? {
                        farmName: result.certificate.farmName,
                        farmerName: result.certificate.farmerName,
                        province: result.certificate.location?.province,
                        cropTypes: result.certificate.cropTypes,
                        issueDate: result.certificate.issueDate,
                        expiryDate: result.certificate.expiryDate,
                        standards: result.certificate.certificationStandards,
                        issuingAuthority: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
                    }
                    : null,
                verifiedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบใบรับรอง',
        });
    }
});

/**
 * @route GET /api/v2/public/verify/:certificateNumber/page
 * @desc Get verification page HTML (for embedding)
 * @access Public
 */
router.get('/verify/:certificateNumber/page', async (req, res) => {
    try {
        const { certificateNumber } = req.params;

        const verificationPage = await GACPCertificateService.generateVerificationPage(certificateNumber);

        // Generate HTML page
        const html = generateVerificationHTML(verificationPage);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch (error) {
        console.error('Verification page error:', error);
        return res.status(500).send('<html><body>เกิดข้อผิดพลาด</body></html>');
    }
});

/**
 * Generate verification HTML page
 */
function generateVerificationHTML(verification) {
    const isValid = verification.result?.valid;
    const cert = verification.publicData;

    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ตรวจสอบใบรับรอง GACP | ${verification.certificateNumber}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Sarabun', sans-serif; 
            background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            padding: 20px; 
        }
        .card { 
            background: white; 
            border-radius: 20px; 
            max-width: 500px; 
            width: 100%; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
            overflow: hidden; 
        }
        .header { 
            background: ${isValid ? '#1b5e20' : '#dc2626'}; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .status-icon { font-size: 60px; margin-bottom: 10px; }
        .header h1 { font-size: 20px; margin-bottom: 5px; }
        .header p { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .cert-number { 
            text-align: center; 
            font-size: 18px; 
            font-weight: bold; 
            color: #1b5e20; 
            margin-bottom: 20px; 
            padding: 15px; 
            background: #f0fdf4; 
            border-radius: 10px; 
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #e0e0e0; 
        }
        .info-label { color: #666; font-size: 14px; }
        .info-value { font-weight: 600; color: #333; text-align: right; }
        .footer { 
            background: #f5f5f5; 
            padding: 15px 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
        }
        .badge { 
            display: inline-block; 
            padding: 5px 15px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: bold; 
        }
        .badge-valid { background: #dcfce7; color: #16a34a; }
        .badge-invalid { background: #fee2e2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="status-icon">${isValid ? '✅' : '❌'}</div>
            <h1>${isValid ? 'ใบรับรองถูกต้อง' : 'ใบรับรองไม่ถูกต้อง'}</h1>
            <p>${isValid ? 'Certificate Verified' : verification.result?.reason || 'Invalid Certificate'}</p>
        </div>
        <div class="content">
            <div class="cert-number">
                ${verification.certificateNumber}
            </div>
            ${cert ? `
                <div class="info-row">
                    <span class="info-label">ชื่อแปลง</span>
                    <span class="info-value">${cert.farmName || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ผู้ประกอบการ</span>
                    <span class="info-value">${cert.farmerName || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">จังหวัด</span>
                    <span class="info-value">${cert.province || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">พืชสมุนไพร</span>
                    <span class="info-value">${cert.cropTypes?.join(', ') || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">วันที่ออก</span>
                    <span class="info-value">${cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('th-TH') : '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">วันหมดอายุ</span>
                    <span class="info-value">${cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('th-TH') : '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">สถานะ</span>
                    <span class="info-value">
                        <span class="badge ${isValid ? 'badge-valid' : 'badge-invalid'}">
                            ${isValid ? 'ใช้งานได้' : 'ไม่สามารถใช้ได้'}
                        </span>
                    </span>
                </div>
            ` : `
                <p style="text-align: center; color: #666; padding: 20px;">
                    ไม่พบข้อมูลใบรับรอง
                </p>
            `}
        </div>
        <div class="footer">
            <p>ตรวจสอบเมื่อ: ${new Date(verification.verificationTimestamp).toLocaleString('th-TH')}</p>
            <p>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก | กระทรวงสาธารณสุข</p>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = router;

