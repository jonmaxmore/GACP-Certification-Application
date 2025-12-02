/**
 * Refresh Token Model
 *
 * Stores refresh tokens for token rotation strategy.
 * Implements token reuse detection for security.
 *
 * @module models/RefreshToken
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true
      // Hash of the actual token (security best practice)
      // Never store raw tokens in database
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true
      // Token rotation: Mark as used after single use
      // Reuse detection: If used token is reused → security breach
    },
    usedAt: {
      type: Date
      // Timestamp when token was used
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
      // TTL index will automatically delete expired tokens
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
refreshTokenSchema.index({ tokenId: 1 });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ isUsed: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

// TTL index: Automatically delete expired tokens after 7 days
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for queries
refreshTokenSchema.index({ userId: 1, isUsed: 1 });
refreshTokenSchema.index({ tokenId: 1, tokenHash: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
