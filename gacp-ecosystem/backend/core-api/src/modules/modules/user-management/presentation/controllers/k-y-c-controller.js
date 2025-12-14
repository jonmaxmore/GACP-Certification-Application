const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('user-management-kyc');

class KYCController {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * Get pending KYC requests
   * GET /api/admin/kyc/pending
   */
  async getPendingKYC(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Use Mongoose model methods (assuming userRepository is a Mongoose model or has model property)
      const repo = this.userRepository.model || this.userRepository;
      const users = await repo.find({ verificationStatus: 'pending' })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await repo.countDocuments({ verificationStatus: 'pending' });

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get pending KYC error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending KYC requests'
      });
    }
  }

  /**
   * Verify User (Approve/Reject)
   * POST /api/admin/kyc/verify
   */
  async verifyUser(req, res) {
    try {
      const { userId, action, reason } = req.body; // action: 'APPROVE' | 'REJECT'

      if (!userId || !action) {
        return res.status(400).json({ success: false, message: 'Missing userId or action' });
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (action === 'APPROVE') {
        user.verificationStatus = 'verified';
      } else if (action === 'REJECT') {
        user.verificationStatus = 'rejected';
        user.notes = reason; // Storing reason in notes field
      } else {
        return res.status(400).json({ success: false, message: 'Invalid action' });
      }

      await this.userRepository.save(user);

      return res.status(200).json({
        success: true,
        message: `User ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
        data: { userId, status: user.status }
      });
    } catch (error) {
      logger.error('Verify user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify user'
      });
    }
  }
}

module.exports = KYCController;
