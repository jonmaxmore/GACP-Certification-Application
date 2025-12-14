/**
 * ComplianceReport.js
 * Model for GACP Mandatory Reporting (Forms 27-32)
 */

const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
    licenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application', // Linking to the approved application/license
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ['form_27', 'form_28', 'form_29', 'form_30', 'form_31', 'form_32'],
        required: true
    },
    period: {
        month: { type: Number, required: true },
        year: { type: Number, required: true }
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Flexible schema for different forms
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'acknowledged', 'rejected'],
        default: 'draft'
    },
    submittedAt: Date,
    acknowledgedAt: Date,
    officerComments: String
}, { timestamps: true });

// Indexes for quick lookup
complianceReportSchema.index({ licenseId: 1, reportType: 1, 'period.year': 1, 'period.month': 1 });

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
