/**
 * Database Models - Central Export
 *
 * Exports all Mongoose models for the GACP Platform.
 * Usage:
 *   const { User, Application, Invoice } = require('./database');
 *
 * @module database
 */

const User = require('./models/User.model');
const Application = require('./models/Application.model');
const Invoice = require('./models/Invoice.model');
const Certificate = require('./models/Certificate.model');
const AuditLog = require('./models/AuditLog.model');

module.exports = {
  // Core Models
  User,
  Application,
  Invoice,
  Certificate,
  AuditLog,

  // Convenience exports
  models: {
    User,
    Application,
    Invoice,
    Certificate,
    AuditLog
  }
};
