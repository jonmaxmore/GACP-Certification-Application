const express = require('express');
const router = express.Router();
const pdfGenerator = require('../services/pdf/pdf-generator.service');
const QRCode = require('qrcode');
const path = require('path');

// Helper: Generate QR Code
async function generateQRCode(data) {
  try {
    return await QRCode.toDataURL(data);
  } catch (err) {
    console.error('QR Code generation error:', err);
    return '';
  }
}

// Helper: Format Thai date
function formatThaiDate(date) {
  const d = new Date(date);
  const thaiYear = d.getFullYear() + 543;
  const months = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${thaiYear}`;
}

// Helper: Thai Baht Text
function numberToThaiText(num) {


  if (num === 0) {
    return 'ศูนย์บาทถ้วน';
  }

  const numStr = num.toString();
  const [baht, satang] = numStr.split('.');
  let result = '';

  // Convert baht
  const bahtNum = parseInt(baht);
  if (bahtNum > 0) {
    // Simplified conversion (full implementation would be more complex)
    result = bahtNum.toLocaleString('th-TH') + ' บาท';
  }

  if (!satang || parseInt(satang) === 0) {
    result += 'ถ้วน';
  }

  return result;
}

// Phase 1: Critical Documents

// 1. Inspection Report (Inspector)
router.post('/inspection-report/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;

    // TODO: Fetch inspection data from database
    const inspectionData = {
      reportNumber: `INS-2025-${inspectionId}`,
      reportDate: formatThaiDate(new Date()),
      applicationNumber: 'GACP-2025-001234',
      inspectionType: 'Video Call Inspection',
      inspectionDate: formatThaiDate(new Date()),
      inspectorName: 'นายสมชาย ใจดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      farmLocation: 'เชียงใหม่',
      cropType: 'กัญชา (Cannabis)',
      checklistItems: `
        <div class="checklist-item">
          <strong>1. คุณภาพเมล็ดพันธุ์:</strong> <span class="status-pass">✓ ผ่าน</span>
          <p>เมล็ดพันธุ์มีคุณภาพดี มีใบรับรองแหล่งที่มา</p>
        </div>
        <div class="checklist-item">
          <strong>2. การจัดการดิน:</strong> <span class="status-pass">✓ ผ่าน</span>
          <p>มีการตรวจสอบคุณภาพดินเป็นประจำ</p>
        </div>
      `,
      summary: 'ฟาร์มมีการจัดการที่ดี ปฏิบัติตามมาตรฐาน GACP ครบถ้วน',
      strengths: 'มีระบบบันทึกข้อมูลที่ดี, พนักงานได้รับการอบรมครบถ้วน',
      weaknesses: 'ควรปรับปรุงระบบการจัดเก็บเอกสาร',
      recommendations: 'แนะนำให้ใช้ระบบดิจิทัลในการจัดเก็บข้อมูล',
      decision: 'อนุมัติ (Approved)',
      decisionColor: '#28a745',
      watermark: 'ต้นฉบับ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/inspector/inspection-report.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, inspectionData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inspection-report-${inspectionId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 2. GACP Certificate (Approver/Farmer)
router.post('/certificate/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const qrCodeUrl = await generateQRCode(`https://gacp.dtam.go.th/verify/${certificateId}`);

    const certificateData = {
      certificateNumber: `GACP-CERT-2025-${certificateId}`,
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      cropType: 'กัญชา (Cannabis sativa L.)',
      farmLocation: 'ตำบลแม่แตง อำเภอแม่แตง จังหวัดเชียงใหม่',
      issueDate: formatThaiDate(new Date()),
      expiryDate: formatThaiDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      qrCodeUrl,
      approverName: 'นายอนุมัติ ตรวจสอบ',
      directorName: 'นายอธิบดี กรมฯ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/approver/certificate.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, certificateData, {
      format: 'A4',
      landscape: false,
      printBackground: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificateId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// 3. Payment Receipt (Farmer)
router.post('/payment-receipt/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const qrCodeUrl = await generateQRCode(`https://gacp.dtam.go.th/receipt/${paymentId}`);

    const amount = 5000;
    const receiptData = {
      receiptNumber: `RCP-2025-${paymentId}`,
      receiptDate: formatThaiDate(new Date()),
      payerName: 'นางสาวสมหญิง รักษ์ดี',
      applicationNumber: 'GACP-2025-001234',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      paymentDescription: 'ค่าธรรมเนียมการยื่นคำขอรับรองมาตรฐาน GACP (Phase 1)',
      paymentType: 'ค่าธรรมเนียมการยื่นคำขอ',
      amount: amount.toLocaleString('th-TH'),
      amountText: numberToThaiText(amount),
      paymentMethod: 'โอนเงินผ่านธนาคาร',
      transactionRef: `TXN${Date.now()}`,
      paymentDate: formatThaiDate(new Date()),
      qrCodeUrl,
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/farmer/payment-receipt.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, receiptData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${paymentId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// 4. Approval Letter (Approver)
router.post('/approval-letter/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { decision } = req.query; // 'approved' or 'rejected'

    const isApproved = decision === 'approved';

    const letterData = {
      letterNumber: `ทม ${Date.now()}/2568`,
      letterDate: formatThaiDate(new Date()),
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      applicationNumber: `GACP-2025-${applicationId}`,
      submissionDate: formatThaiDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      cropType: 'กัญชา (Cannabis)',
      inspectionDate: formatThaiDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      totalScore: isApproved ? '85' : '65',
      decisionText: isApproved ? 'อนุมัติการรับรองมาตรฐาน GACP' : 'ไม่อนุมัติการรับรองมาตรฐาน GACP',
      borderColor: isApproved ? '#28a745' : '#dc3545',
      bgColor: isApproved ? '#d4edda' : '#f8d7da',
      textColor: isApproved ? '#155724' : '#721c24',
      reasons: isApproved
        ? 'ฟาร์มมีการจัดการที่ดี ปฏิบัติตามมาตรฐาน GACP ครบถ้วน ผ่านการตรวจสอบทุกข้อ'
        : 'พบข้อบกพร่องในการจัดการดิน และการบันทึกข้อมูล ไม่ผ่านเกณฑ์ขั้นต่ำ',
      conditions: isApproved ? 'ต้องรายงานผลการดำเนินงานทุก 6 เดือน' : '',
      nextSteps: isApproved
        ? 'จะได้รับใบรับรองภายใน 7 วันทำการ'
        : 'สามารถยื่นคำขอใหม่ได้หลังจาก 3 เดือน',
      contactInfo: 'กรมการแพทย์แผนไทยฯ โทร 02-xxx-xxxx',
      approverName: 'นายอนุมัติ ตรวจสอบ',
      approverPosition: 'ผู้อำนวยการกอง',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/approver/approval-letter.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, letterData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=approval-letter-${applicationId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate approval letter' });
  }
});

// Phase 2: Workflow Documents

// 5. Application Summary (Reviewer)
router.post('/application-summary/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const summaryData = {
      applicationNumber: `GACP-2025-${applicationId}`,
      reportDate: formatThaiDate(new Date()),
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      idNumber: '1-2345-67890-12-3',
      address: '123 หมู่ 5 ตำบลแม่แตง อำเภอแม่แตง จังหวัดเชียงใหม่ 50150',
      phone: '081-234-5678',
      email: 'somying@example.com',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      farmLocation: 'ตำบลแม่แตง อำเภอแม่แตง จังหวัดเชียงใหม่',
      totalArea: '10',
      cultivatedArea: '8',
      cropType: 'กัญชา (Cannabis)',
      documentsList: `
        <tr><td>สำเนาบัตรประชาชน</td><td style="color: #28a745;">✓ ผ่าน</td><td>-</td></tr>
        <tr><td>เอกสารสิทธิ์ที่ดิน</td><td style="color: #28a745;">✓ ผ่าน</td><td>-</td></tr>
        <tr><td>แผนผังฟาร์ม</td><td style="color: #ffc107;">รอตรวจสอบ</td><td>ต้องเพิ่มรายละเอียด</td></tr>
      `,
      currentStatus: 'อยู่ระหว่างตรวจสอบเอกสาร',
      reviewerName: 'นายตรวจสอบ เอกสาร',
      reviewStartDate: formatThaiDate(new Date()),
      historyList: `
        <tr><td>${formatThaiDate(new Date())}</td><td>ยื่นคำขอ</td><td>นางสาวสมหญิง รักษ์ดี</td></tr>
        <tr><td>${formatThaiDate(new Date())}</td><td>เริ่มตรวจสอบเอกสาร</td><td>นายตรวจสอบ เอกสาร</td></tr>
      `,
      watermark: 'ต้นฉบับ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/reviewer/application-summary.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, summaryData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=application-summary-${applicationId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 6. Document Verification Report (Reviewer)
router.post('/document-verification/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const verificationData = {
      reportNumber: `VER-2025-${applicationId}`,
      reportDate: formatThaiDate(new Date()),
      applicationNumber: `GACP-2025-${applicationId}`,
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      verificationResults: `
        <tr><td>สำเนาบัตรประชาชน</td><td class="doc-status-pass">✓ ผ่าน</td><td>-</td><td>-</td></tr>
        <tr><td>เอกสารสิทธิ์ที่ดิน</td><td class="doc-status-pass">✓ ผ่าน</td><td>-</td><td>-</td></tr>
        <tr><td>แผนผังฟาร์ม</td><td class="doc-status-fail">✗ ไม่ผ่าน</td><td>ขาดรายละเอียดแปลงเพาะปลูก</td><td>เพิ่มข้อมูลพิกัด GPS</td></tr>
        <tr><td>บันทึกการเพาะปลูก</td><td class="doc-status-pass">✓ ผ่าน</td><td>-</td><td>-</td></tr>
      `,
      totalDocuments: '4',
      passedDocuments: '3',
      failedDocuments: '1',
      overallResult: 'ผ่านเงื่อนไข (มีข้อแก้ไข)',
      resultColor: '#ffc107',
      recommendations:
        'เกษตรกรควรปรับปรุงแผนผังฟาร์มให้มีรายละเอียดครบถ้วน รวมถึงพิกัด GPS ของแต่ละแปลง',
      nextSteps: 'เมื่อเกษตรกรแก้ไขเอกสารเรียบร้อยแล้ว จะดำเนินการมอบหมายให้ผู้ตรวจสอบภาคสนาม',
      reviewerName: 'นายตรวจสอบ เอกสาร',
      verificationDate: formatThaiDate(new Date()),
      watermark: 'ต้นฉบับ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/reviewer/document-verification.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, verificationData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=document-verification-${applicationId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 7. Inspection Appointment Letter (Inspector/Farmer)
router.post('/inspection-appointment/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;

    const appointmentData = {
      letterNumber: `ทม ${Date.now()}/2568`,
      letterDate: formatThaiDate(new Date()),
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      applicationNumber: 'GACP-2025-001234',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      inspectionDate: formatThaiDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      inspectionTime: '10:00 - 12:00 น.',
      inspectionType: 'Video Call Inspection',
      farmLocation: 'ตำบลแม่แตง อำเภอแม่แตง จังหวัดเชียงใหม่',
      cropType: 'กัญชา (Cannabis)',
      inspectorName: 'นายสมชาย ใจดี',
      inspectorPhone: '081-234-5678',
      inspectorEmail: 'somchai@dtam.go.th',
      isVideoCall: true,
      platformUrl: 'https://gacp.dtam.go.th',
      gpsCoordinates: '18.7756° N, 98.9319° E',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/inspector/appointment-letter.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, appointmentData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=appointment-${inspectionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 8. Inspection Checklist (Inspector)
router.post('/inspection-checklist/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;

    const checklistData = {
      checklistNumber: `CHK-2025-${inspectionId}`,
      inspectionDate: formatThaiDate(new Date()),
      applicationNumber: 'GACP-2025-001234',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      inspectorName: 'นายสมชาย ใจดี',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/inspector/inspection-checklist.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, checklistData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=checklist-${inspectionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Phase 3: Performance Reports

// 9. Reviewer Performance Report
router.post('/reviewer-performance/:reviewerId', async (req, res) => {
  try {
    const { reviewerId } = req.params;

    const performanceData = {
      reviewerId,
      periodStart: formatThaiDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      periodEnd: formatThaiDate(new Date()),
      reviewerName: 'นายตรวจสอบ เอกสาร',
      position: 'เจ้าหน้าที่ตรวจสอบเอกสาร',
      department: 'แผนกตรวจสอบและรับรอง',
      totalReviewed: '45',
      avgTime: '2.5',
      passRate: '82',
      rejectionRate: '18',
      passedCount: '37',
      failedCount: '8',
      pendingCount: '0',
      pendingRate: '0',
      cannabisCount: '30',
      cannabisAvgTime: '2.3',
      turmericCount: '10',
      turmericAvgTime: '2.8',
      gingerCount: '3',
      gingerAvgTime: '2.5',
      othersCount: '2',
      othersAvgTime: '3.0',
      topIssues: `
        <tr><td>1</td><td>แผนผังฟาร์มไม่ชัดเจน</td><td>12</td></tr>
        <tr><td>2</td><td>ขาดเอกสารสิทธิ์ที่ดิน</td><td>8</td></tr>
        <tr><td>3</td><td>บันทึกการเพาะปลูกไม่ครบ</td><td>6</td></tr>
      `,
      currentMonthCount: '45',
      lastMonthCount: '38',
      changePercent: '+18.4',
      changeColor: '#28a745',
      supervisorName: 'นายหัวหน้า แผนก',
      reportDate: formatThaiDate(new Date()),
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/reviewer/performance-report.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, performanceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reviewer-performance-${reviewerId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 10. Inspector Performance Report
router.post('/inspector-performance/:inspectorId', async (req, res) => {
  try {
    const { inspectorId } = req.params;

    const performanceData = {
      inspectorId,
      periodStart: formatThaiDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      periodEnd: formatThaiDate(new Date()),
      inspectorName: 'นายสมชาย ใจดี',
      position: 'เจ้าหน้าที่ตรวจสอบภาคสนาม',
      responsibleArea: 'ภาคเหนือ (เชียงใหม่, เชียงราย, ลำปาง)',
      totalInspections: '32',
      avgTime: '3.5',
      approvalRate: '75',
      avgScore: '82',
      videoCount: '20',
      videoPercent: '62.5',
      onsiteCount: '12',
      onsitePercent: '37.5',
      approvedCount: '24',
      needOnsiteCount: '5',
      needOnsiteRate: '15.6',
      rejectedCount: '3',
      rejectionRate: '9.4',
      cannabisCount: '22',
      cannabisAvgScore: '84',
      cannabisPassRate: '77',
      turmericCount: '7',
      turmericAvgScore: '78',
      turmericPassRate: '71',
      gingerCount: '2',
      gingerAvgScore: '80',
      gingerPassRate: '100',
      othersCount: '1',
      othersAvgScore: '75',
      othersPassRate: '100',
      commonIssues: `
        <tr><td>CCP 2</td><td>การจัดการดินไม่เหมาะสม</td><td>8</td></tr>
        <tr><td>CCP 7</td><td>การบันทึกข้อมูลไม่ครบถ้วน</td><td>6</td></tr>
        <tr><td>CCP 3</td><td>การควบคุมศัตรูพืชไม่เพียงพอ</td><td>4</td></tr>
      `,
      currentMonthCount: '32',
      lastMonthCount: '28',
      targetCount: '30',
      statusText: 'เกินเป้าหมาย',
      statusColor: '#28a745',
      supervisorName: 'นายหัวหน้า แผนก',
      reportDate: formatThaiDate(new Date()),
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/inspector/performance-report.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, performanceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inspector-performance-${inspectorId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 11. Approval Statistics Report
router.post('/approval-statistics', async (req, res) => {
  try {
    const statsData = {
      periodStart: formatThaiDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
      periodEnd: formatThaiDate(new Date()),
      reportDate: formatThaiDate(new Date()),
      totalApplications: '150',
      approvedCount: '105',
      rejectedCount: '30',
      pendingCount: '15',
      approvalRate: '70',
      rejectionRate: '20',
      pendingRate: '10',
      avgDecisionTime: '38',
      minDecisionTime: '15',
      maxDecisionTime: '65',
      cannabisTotal: '90',
      cannabisApproved: '65',
      cannabisRejected: '18',
      cannabisRate: '72',
      turmericTotal: '35',
      turmericApproved: '25',
      turmericRejected: '8',
      turmericRate: '71',
      gingerTotal: '15',
      gingerApproved: '10',
      gingerRejected: '3',
      gingerRate: '67',
      othersTotal: '10',
      othersApproved: '5',
      othersRejected: '1',
      othersRate: '50',
      rejectionReasons: `
        <tr><td>1</td><td>คะแนนรวมต่ำกว่าเกณฑ์</td><td>12</td><td>40%</td></tr>
        <tr><td>2</td><td>ข้อบกพร่องร้ายแรงใน CCP</td><td>8</td><td>27%</td></tr>
        <tr><td>3</td><td>เอกสารไม่ครบถ้วน</td><td>6</td><td>20%</td></tr>
        <tr><td>4</td><td>พื้นที่ไม่เหมาะสม</td><td>4</td><td>13%</td></tr>
      `,
      northTotal: '45',
      northApproved: '32',
      northRate: '71',
      centralTotal: '35',
      centralApproved: '24',
      centralRate: '69',
      northeastTotal: '40',
      northeastApproved: '28',
      northeastRate: '70',
      southTotal: '30',
      southApproved: '21',
      southRate: '70',
      monthlyTrend: `
        <tr><td>มกราคม 2568</td><td>45</td><td>32</td><td>71%</td></tr>
        <tr><td>กุมภาพันธ์ 2568</td><td>52</td><td>36</td><td>69%</td></tr>
        <tr><td>มีนาคม 2568</td><td>53</td><td>37</td><td>70%</td></tr>
      `,
      approverName: 'นายอนุมัติ ตรวจสอบ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/approver/statistics-report.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, statsData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=approval-statistics.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 12. System Summary Report
router.post('/system-summary', async (req, res) => {
  try {
    const summaryData = {
      reportDate: formatThaiDate(new Date()),
      periodStart: formatThaiDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
      periodEnd: formatThaiDate(new Date()),
      totalUsers: '1,245',
      totalApplications: '856',
      totalCertificates: '542',
      farmerCount: '1,150',
      farmerPercent: '92.4',
      reviewerCount: '35',
      reviewerPercent: '2.8',
      inspectorCount: '40',
      inspectorPercent: '3.2',
      approverCount: '15',
      approverPercent: '1.2',
      adminCount: '5',
      adminPercent: '0.4',
      draftCount: '45',
      draftPercent: '5.3',
      submittedCount: '120',
      submittedPercent: '14.0',
      reviewCount: '85',
      reviewPercent: '9.9',
      inspectionCount: '64',
      inspectionPercent: '7.5',
      approvedCount: '542',
      approvedPercent: '63.3',
      rejectedCount: '0',
      rejectedPercent: '0',
      totalLogins: '15,234',
      avgDailyUsers: '285',
      totalDocuments: '4,523',
      totalDataSize: '12.5',
      uptime: '99.8',
      uptimeColor: '#28a745',
      uptimeStatus: '✓ ผ่าน',
      responseTime: '245',
      responseColor: '#28a745',
      responseStatus: '✓ ผ่าน',
      errorRate: '0.05',
      errorColor: '#28a745',
      errorStatus: '✓ ผ่าน',
      totalRevenue: '25,680,000',
      avgFee: '30,000',
      successfulPayments: '856',
      paymentSuccessRate: '100',
      northFarmers: '425',
      northApps: '320',
      northCerts: '215',
      centralFarmers: '285',
      centralApps: '210',
      centralCerts: '135',
      northeastFarmers: '320',
      northeastApps: '230',
      northeastCerts: '145',
      southFarmers: '120',
      southApps: '96',
      southCerts: '47',
      topProvinces: `
        <tr><td>1</td><td>เชียงใหม่</td><td>145</td><td>98</td></tr>
        <tr><td>2</td><td>เชียงราย</td><td>98</td><td>65</td></tr>
        <tr><td>3</td><td>นครราชสีมา</td><td>87</td><td>54</td></tr>
        <tr><td>4</td><td>ขอนแก่น</td><td>76</td><td>48</td></tr>
        <tr><td>5</td><td>กรุงเทพฯ</td><td>65</td><td>42</td></tr>
      `,
      adminName: 'นายผู้ดูแล ระบบ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/admin/system-summary.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, summaryData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=system-summary.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Phase 4: Additional Documents

// 13. Farmer Application Confirmation
router.post('/farmer-confirmation/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const qrCodeUrl = await generateQRCode(`https://gacp.dtam.go.th/application/${applicationId}`);

    const confirmationData = {
      applicationNumber: `GACP-2025-${applicationId}`,
      submissionDate: formatThaiDate(new Date()),
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      cropType: 'กัญชา (Cannabis)',
      documentsList: `
        <tr><td>สำเนาบัตรประชาชน</td><td style="color: #28a745;">✓ ส่งแล้ว</td></tr>
        <tr><td>เอกสารสิทธิ์ที่ดิน</td><td style="color: #28a745;">✓ ส่งแล้ว</td></tr>
        <tr><td>แผนผังฟาร์ม</td><td style="color: #28a745;">✓ ส่งแล้ว</td></tr>
      `,
      qrCodeUrl,
    };

    const templatePath = path.join(__dirname, '../services/pdf/templates/farmer/confirmation.html');
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, confirmationData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=confirmation-${applicationId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 14. Video Inspection Detailed Report
router.post('/video-inspection-report/:inspectionId', async (req, res) => {
  try {
    const { inspectionId } = req.params;

    const videoReportData = {
      reportNumber: `VID-2025-${inspectionId}`,
      reportDate: formatThaiDate(new Date()),
      applicationNumber: 'GACP-2025-001234',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      inspectorName: 'นายสมชาย ใจดี',
      callDate: formatThaiDate(new Date()),
      startTime: '10:00',
      endTime: '11:30',
      duration: '90',
      participants: 'นางสาวสมหญิง รักษ์ดี, นายสมชาย ใจดี',
      snapshotImages:
        '<div class="snapshot"><div>ภาพที่ 1: พื้นที่เพาะปลูก</div></div><div class="snapshot"><div>ภาพที่ 2: ระบบน้ำ</div></div><div class="snapshot"><div>ภาพที่ 3: คลังเก็บ</div></div>',
      observations: 'ฟาร์มมีการจัดการที่ดี มีระบบบันทึกข้อมูลครบถ้วน พนักงานมีความรู้เรื่อง GACP',
      ccpResults: `
        <tr><td>CCP 1</td><td>คุณภาพเมล็ดพันธุ์</td><td>9/10</td></tr>
        <tr><td>CCP 2</td><td>การจัดการดิน</td><td>8/10</td></tr>
        <tr><td>CCP 3</td><td>การจัดการศัตรูพืช</td><td>9/10</td></tr>
      `,
      totalScore: '72',
      decision: 'อนุมัติ (Approved)',
      decisionColor: '#28a745',
      recommendations: 'แนะนำให้ปรับปรุงระบบการจัดเก็บเอกสารให้เป็นดิจิทัล',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/inspector/video-report.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, videoReportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=video-report-${inspectionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 15. Complete Inspection Summary
router.post('/complete-summary/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const summaryData = {
      applicationNumber: `GACP-2025-${applicationId}`,
      reportDate: formatThaiDate(new Date()),
      farmerName: 'นางสาวสมหญิง รักษ์ดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      cropType: 'กัญชา (Cannabis)',
      submissionDate: formatThaiDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      reviewerName: 'นายตรวจสอบ เอกสาร',
      reviewDate: formatThaiDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
      reviewNotes: 'เอกสารครบถ้วน ผ่านการตรวจสอบ',
      inspectorName: 'นายสมชาย ใจดี',
      inspectionType: 'Video Call Inspection',
      inspectionDate: formatThaiDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      inspectionScore: '72',
      inspectionDecision: 'อนุมัติ',
      inspectionColor: '#28a745',
      ccpScores: `
        <tr><td>CCP 1</td><td>คุณภาพเมล็ดพันธุ์</td><td>9/10</td><td style="color: #28a745;">✓ ผ่าน</td></tr>
        <tr><td>CCP 2</td><td>การจัดการดิน</td><td>8/10</td><td style="color: #28a745;">✓ ผ่าน</td></tr>
        <tr><td>CCP 3</td><td>การจัดการศัตรูพืช</td><td>9/10</td><td style="color: #28a745;">✓ ผ่าน</td></tr>
      `,
      snapshotCount: '12',
      totalScore: '85',
      certificateLevel: 'ระดับดี (Good)',
      recommendation: 'แนะนำให้อนุมัติการรับรองมาตรฐาน GACP',
      approverRecommendation: 'ฟาร์มมีการจัดการที่ดี ผ่านเกณฑ์การประเมินทุกข้อ แนะนำให้อนุมัติ',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/approver/complete-summary.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, summaryData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=complete-summary-${applicationId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 16. Financial Report
router.post('/financial-report', async (req, res) => {
  try {
    const financialData = {
      periodStart: formatThaiDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
      periodEnd: formatThaiDate(new Date()),
      reportDate: formatThaiDate(new Date()),
      totalRevenue: '25,680,000',
      phase1Count: '856',
      phase1Revenue: '4,280,000',
      phase2Count: '856',
      phase2Revenue: '21,400,000',
      totalCount: '856',
      paidCount: '856',
      paidPercent: '100',
      paidAmount: '25,680,000',
      pendingCount: '0',
      pendingPercent: '0',
      pendingAmount: '0',
      refundCount: '0',
      refundPercent: '0',
      refundAmount: '0',
      cannabisCount: '600',
      cannabisRevenue: '18,000,000',
      cannabisPercent: '70',
      turmericCount: '150',
      turmericRevenue: '4,500,000',
      turmericPercent: '17.5',
      gingerCount: '80',
      gingerRevenue: '2,400,000',
      gingerPercent: '9.3',
      othersCount: '26',
      othersRevenue: '780,000',
      othersPercent: '3.2',
      northCount: '320',
      northRevenue: '9,600,000',
      centralCount: '210',
      centralRevenue: '6,300,000',
      northeastCount: '230',
      northeastRevenue: '6,900,000',
      southCount: '96',
      southRevenue: '2,880,000',
      monthlyTrend: `
        <tr><td>มกราคม 2568</td><td>280</td><td>8,400,000</td><td style="color: #28a745;">+12%</td></tr>
        <tr><td>กุมภาพันธ์ 2568</td><td>290</td><td>8,700,000</td><td style="color: #28a745;">+3.6%</td></tr>
        <tr><td>มีนาคม 2568</td><td>286</td><td>8,580,000</td><td style="color: #dc3545;">-1.4%</td></tr>
      `,
      bankTransferCount: '650',
      bankTransferPercent: '76',
      cardCount: '150',
      cardPercent: '17.5',
      promptpayCount: '56',
      promptpayPercent: '6.5',
      financeOfficer: 'นางสาวการเงิน บัญชี',
    };

    const templatePath = path.join(
      __dirname,
      '../services/pdf/templates/admin/financial-report.html',
    );
    const pdfBuffer = await pdfGenerator.generateFromTemplate(templatePath, financialData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PDF Export Service',
    phase: 'All Phases Complete (1-4)',
    documents: 16,
    version: '1.0.0',
  });
});

module.exports = router;
