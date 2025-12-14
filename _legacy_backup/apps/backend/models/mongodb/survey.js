/**
 * Survey Model - MongoDB Mongoose Schema
 * Stub implementation for survey data
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const surveySchema = new Schema({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  surveyType: {
    type: String,
    enum: ['4-regions', 'cannabis', 'general'],
    default: '4-regions',
  },
  region: {
    type: String,
    enum: ['central', 'southern', 'northern', 'northeastern'],
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved'],
    default: 'draft',
  },
  responses: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

surveySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
