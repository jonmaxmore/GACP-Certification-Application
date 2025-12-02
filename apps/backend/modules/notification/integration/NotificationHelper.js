/**
 * Notification Helper Module
 *
 * Provides convenient functions for other modules to send notifications.
 * Part of Clean Architecture - Integration Layer
 */

const logger = require('../../../shared/logger/logger');
const Notification = require('../domain/entities/Notification');

class NotificationHelper {
  constructor(sendNotificationUseCase) {
    this.sendNotificationUseCase = sendNotificationUseCase;
  }

  // Farm Notifications
  async notifyFarmApproved(farmData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.FARM_APPROVED,
      title: `ฟาร์ม ${farmData.name} ได้รับการอนุมัติแล้ว`,
      message: 'ฟาร์มของท่านได้รับการอนุมัติเรียบร้อยแล้ว สามารถดำเนินการขั้นตอนต่อไปได้',
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/farms/${farmData.id}`,
      actionLabel: 'ดูรายละเอียดฟาร์ม',
      relatedEntity: { type: 'farm', id: farmData.id },
      metadata: { farmName: farmData.name },
    });
  }

  async notifyFarmRejected(farmData, farmerData, reason) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.FARM_REJECTED,
      title: `ฟาร์ม ${farmData.name} ไม่ได้รับการอนุมัติ`,
      message: `ฟาร์มของท่านไม่ได้รับการอนุมัติ เนื่องจาก: ${reason}`,
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/farms/${farmData.id}`,
      actionLabel: 'แก้ไขข้อมูล',
      relatedEntity: { type: 'farm', id: farmData.id },
      metadata: { farmName: farmData.name, reason },
    });
  }

  // Survey Notifications
  async notifySurveySubmitted(surveyData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.SURVEY_SUBMITTED,
      title: 'ส่งแบบสำรวจ GAP สำเร็จ',
      message: `แบบสำรวจของฟาร์ม ${surveyData.farmName} ถูกส่งเรียบร้อยแล้ว รอการตรวจสอบจากเจ้าหน้าที่`,
      priority: Notification.PRIORITY.MEDIUM,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/surveys/${surveyData.id}`,
      actionLabel: 'ดูแบบสำรวจ',
      relatedEntity: { type: 'survey', id: surveyData.id },
    });
  }

  async notifySurveyApproved(surveyData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.SURVEY_APPROVED,
      title: 'แบบสำรวจ GAP ได้รับการอนุมัติ',
      message: `แบบสำรวจของฟาร์ม ${surveyData.farmName} ได้รับการอนุมัติแล้ว`,
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/surveys/${surveyData.id}`,
      actionLabel: 'ดูผลการประเมิน',
      relatedEntity: { type: 'survey', id: surveyData.id },
    });
  }

  async notifySurveyRevisionRequired(surveyData, farmerData, reason) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.SURVEY_REVISION_REQUIRED,
      title: 'แบบสำรวจต้องแก้ไข',
      message: `แบบสำรวจของฟาร์ม ${surveyData.farmName} ต้องแก้ไข: ${reason}`,
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/surveys/${surveyData.id}/edit`,
      actionLabel: 'แก้ไขแบบสำรวจ',
      relatedEntity: { type: 'survey', id: surveyData.id },
      metadata: { reason },
    });
  }

  // Certificate Notifications
  async notifyCertificateIssued(certificateData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.CERTIFICATE_ISSUED,
      title: 'ออกใบรับรองสำเร็จ',
      message: `ใบรับรอง GACP เลขที่ ${certificateData.certificateNumber} ถูกออกเรียบร้อยแล้ว`,
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/certificates/${certificateData.id}`,
      actionLabel: 'ดาวน์โหลดใบรับรอง',
      relatedEntity: { type: 'certificate', id: certificateData.id },
    });
  }

  async notifyCertificateExpiring(certificateData, farmerData, daysLeft) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.CERTIFICATE_EXPIRING,
      title: '⚠️ ใบรับรองใกล้หมดอายุ',
      message: `ใบรับรอง ${certificateData.certificateNumber} จะหมดอายุใน ${daysLeft} วัน กรุณาต่ออายุ`,
      priority: Notification.PRIORITY.URGENT,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL, Notification.CHANNEL.SMS],
      actionUrl: `/farmer/certificates/${certificateData.id}/renew`,
      actionLabel: 'ต่ออายุใบรับรอง',
      relatedEntity: { type: 'certificate', id: certificateData.id },
      metadata: { daysLeft },
    });
  }

  async notifyCertificateExpired(certificateData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.CERTIFICATE_EXPIRED,
      title: '⚠️ ใบรับรองหมดอายุแล้ว',
      message: `ใบรับรอง ${certificateData.certificateNumber} หมดอายุแล้ว กรุณาดำเนินการต่ออายุโดยเร็ว`,
      priority: Notification.PRIORITY.URGENT,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/certificates/${certificateData.id}/renew`,
      actionLabel: 'ต่ออายุใบรับรอง',
      relatedEntity: { type: 'certificate', id: certificateData.id },
    });
  }

  // Training Notifications
  async notifyTrainingEnrolled(courseData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.TRAINING_ENROLLED,
      title: 'ลงทะเบียนอบรมสำเร็จ',
      message: `ท่านได้ลงทะเบียนคอร์ส ${courseData.title} เรียบร้อยแล้ว`,
      priority: Notification.PRIORITY.MEDIUM,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/training/${courseData.id}`,
      actionLabel: 'เริ่มเรียน',
      relatedEntity: { type: 'course', id: courseData.id },
    });
  }

  async notifyTrainingCompleted(courseData, farmerData, score) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.TRAINING_COMPLETED,
      title: '🎉 จบคอร์สอบรมแล้ว',
      message: `ท่านจบคอร์ส ${courseData.title} แล้ว คะแนน: ${score}%`,
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/training/${courseData.id}/certificate`,
      actionLabel: 'ดาวน์โหลดใบประกาศนียบัตร',
      relatedEntity: { type: 'course', id: courseData.id },
      metadata: { score },
    });
  }

  // Document Notifications
  async notifyDocumentApproved(documentData, farmerData) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.DOCUMENT_APPROVED,
      title: 'เอกสารได้รับการอนุมัติ',
      message: `เอกสาร ${documentData.name} ได้รับการอนุมัติแล้ว`,
      priority: Notification.PRIORITY.MEDIUM,
      channels: [Notification.CHANNEL.IN_APP],
      actionUrl: `/farmer/documents/${documentData.id}`,
      relatedEntity: { type: 'document', id: documentData.id },
    });
  }

  async notifyDocumentRejected(documentData, farmerData, reason) {
    return this.sendNotificationUseCase.execute({
      recipientId: farmerData.id,
      recipientEmail: farmerData.email,
      type: Notification.TYPE.DOCUMENT_REJECTED,
      title: 'เอกสารไม่ได้รับการอนุมัติ',
      message: `เอกสาร ${documentData.name} ไม่ได้รับการอนุมัติ: ${reason}`,
      priority: Notification.PRIORITY.HIGH,
      channels: [Notification.CHANNEL.IN_APP, Notification.CHANNEL.EMAIL],
      actionUrl: `/farmer/documents/${documentData.id}`,
      actionLabel: 'อัพโหลดเอกสารใหม่',
      relatedEntity: { type: 'document', id: documentData.id },
      metadata: { reason },
    });
  }

  // System Notifications
  async sendSystemAnnouncement(title, message, priority = Notification.PRIORITY.MEDIUM) {
    // Use SendBroadcastNotificationUseCase for system announcements
    // This is a helper - actual implementation should use the broadcast use case
    logger.info('System announcement:', { title, message, priority });
    // Implementation depends on broadcast use case availability
  }
}

module.exports = NotificationHelper;
