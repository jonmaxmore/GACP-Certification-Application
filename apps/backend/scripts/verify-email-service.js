const EmailService = require('../services/email/EmailService');
const logger = require('../shared/logger');
require('dotenv').config(); // Load env vars

async function verify() {
  try {
    console.log('Initializing EmailService...');
    const emailService = new EmailService();

    console.log('Verifying connection...');
    const isConnected = await emailService.verifyConnection();

    console.log('Email Service Connection:', isConnected ? 'SUCCESS' : 'FAILED');

    if (isConnected) {
        // Try to send a test email if connected?
        // Maybe not, to avoid spamming real addresses if configured.
        // But verifyConnection checks the transporter.
    }

  } catch (error) {
    console.error('Error verifying email service:', error);
  }
}

verify();
