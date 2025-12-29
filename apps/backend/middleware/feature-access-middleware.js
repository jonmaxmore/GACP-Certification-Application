/**
 * Feature Access Control Middleware
 *
 * ตรวจสอบว่าฟาร์มมีสิทธิ์เข้าถึงฟีเจอร์หรือไม่
 * เบื้องต้นให้ใช้ฟรีทั้งหมด แต่เตรียมพร้อมสำหรับ subscription model
 */

/**
 * Subscription Tiers และ Features ที่เปิดให้ใช้
 */
const SUBSCRIPTION_FEATURES = {
  free: {
    name: 'Free Tier',
    price: 0,
    features: {
      basicFarmManagement: true,
      gacpCompliance: true,
      // Phase 2: IoT (เบื้องต้นฟรี)
      iotMonitoring: true, // ⚠️ อนาคตอาจเป็น premium
      // Phase 3: AI (เบื้องต้นฟรี)
      aiRecommendations: true, // ⚠️ อนาคตอาจเป็น premium
      // Limits
      maxDevices: 5,
      maxAlerts: 10,
      aiRequestsPerMonth: 100,
    },
  },
  basic: {
    name: 'Basic Plan',
    price: 500, // THB/month
    features: {
      basicFarmManagement: true,
      gacpCompliance: true,
      iotMonitoring: true,
      aiRecommendations: true,
      maxDevices: 20,
      maxAlerts: 50,
      aiRequestsPerMonth: 500,
    },
  },
  premium: {
    name: 'Premium Plan',
    price: 2000, // THB/month
    features: {
      basicFarmManagement: true,
      gacpCompliance: true,
      iotMonitoring: true,
      aiRecommendations: true,
      advancedAnalytics: true,
      customReports: true,
      prioritySupport: true,
      maxDevices: 100,
      maxAlerts: 500,
      aiRequestsPerMonth: 5000,
    },
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 10000, // THB/month
    features: {
      basicFarmManagement: true,
      gacpCompliance: true,
      iotMonitoring: true,
      aiRecommendations: true,
      advancedAnalytics: true,
      customReports: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true,
      maxDevices: -1, // Unlimited
      maxAlerts: -1, // Unlimited
      aiRequestsPerMonth: -1, // Unlimited
    },
  },
};

/**
 * ตรวจสอบว่าฟาร์มมีสิทธิ์เข้าถึงฟีเจอร์หรือไม่
 */
function hasFeatureAccess(farm, featureName) {
  // เบื้องต้นให้ใช้ฟรีทั้งหมด (อนาคตจะเช็คจาก subscription)
  if (!farm.subscription || !farm.subscription.tier) {
    // ถ้าไม่มี subscription ให้ใช้ free tier
    return SUBSCRIPTION_FEATURES.free.features[featureName] || false;
  }

  const tier = farm.subscription.tier;
  const tierFeatures = SUBSCRIPTION_FEATURES[tier];

  if (!tierFeatures) {
    // ถ้า tier ไม่ถูกต้อง ให้ใช้ free tier
    return SUBSCRIPTION_FEATURES.free.features[featureName] || false;
  }

  return tierFeatures.features[featureName] || false;
}

/**
 * ตรวจสอบว่า subscription หมดอายุหรือไม่
 */
function isSubscriptionActive(farm) {
  // เบื้องต้นให้ใช้ฟรีตลอด
  if (!farm.subscription || !farm.subscription.tier) {
    return true; // Free tier ไม่มีวันหมดอายุ
  }

  if (farm.subscription.tier === 'free') {
    return true;
  }

  // ตรวจสอบวันหมดอายุ
  if (farm.subscription.expiryDate) {
    const now = new Date();
    return now < farm.subscription.expiryDate;
  }

  // ถ้าไม่มี expiryDate ให้ถือว่า active
  return true;
}

/**
 * Middleware: ตรวจสอบ Feature Access
 */
function checkFeatureAccess(featureName) {
  return async (req, res, next) => {
    try {
      const farmId = req.params.farmId || req.body.farmId || req.query.farmId;

      if (!farmId) {
        return res.status(400).json({
          success: false,
          message: 'Farm ID is required',
        });
      }

      // ดึงข้อมูลฟาร์ม
      const Farm = require('../models/Farm');
      const farm = await Farm.findById(farmId);

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found',
        });
      }

      // ตรวจสอบ subscription ว่าหมดอายุหรือไม่
      if (!isSubscriptionActive(farm)) {
        return res.status(403).json({
          success: false,
          message: 'Subscription expired. Please renew your subscription.',
          code: 'SUBSCRIPTION_EXPIRED',
        });
      }

      // ตรวจสอบว่ามีสิทธิ์เข้าถึงฟีเจอร์หรือไม่
      if (!hasFeatureAccess(farm, featureName)) {
        const tier = farm.subscription?.tier || 'free';
        return res.status(403).json({
          success: false,
          message: `This feature is not available in your current plan (${tier})`,
          code: 'FEATURE_NOT_AVAILABLE',
          currentTier: tier,
          requiredTier: getRequiredTier(featureName),
          upgradeUrl: '/api/subscriptions/upgrade',
        });
      }

      // เพิ่มข้อมูลฟาร์มเข้า request
      req.farm = farm;
      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking feature access',
        error: error.message,
      });
    }
  };
}

/**
 * หา tier ที่ต้องการสำหรับฟีเจอร์นั้นๆ
 */
function getRequiredTier(featureName) {
  for (const [tier, config] of Object.entries(SUBSCRIPTION_FEATURES)) {
    if (config.features[featureName]) {
      return tier;
    }
  }
  return 'premium';
}

/**
 * ตรวจสอบ usage limit (เช่น จำนวน IoT devices, AI requests)
 */
function checkUsageLimit(farm, limitType) {
  const tier = farm.subscription?.tier || 'free';
  const tierConfig = SUBSCRIPTION_FEATURES[tier];

  if (!tierConfig) {
    return {
      allowed: true,
      limit: SUBSCRIPTION_FEATURES.free.features[limitType],
      current: 0,
    };
  }

  const limit = tierConfig.features[limitType];

  // -1 = unlimited
  if (limit === -1) {
    return {
      allowed: true,
      limit: 'unlimited',
      current: 0,
    };
  }

  // ต้องดึงข้อมูล usage จริงมาเช็ค (ยังไม่ implement)
  const currentUsage = 0; // TODO: implement usage tracking

  return {
    allowed: currentUsage < limit,
    limit,
    current: currentUsage,
    remaining: limit - currentUsage,
  };
}

/**
 * Middleware: ตรวจสอบว่าฟาร์มเปิดใช้ฟีเจอร์หรือไม่
 */
function requireFeatureEnabled(featurePath) {
  return async (req, res, next) => {
    try {
      const farm = req.farm;

      if (!farm) {
        return res.status(400).json({
          success: false,
          message: 'Farm context is required. Use checkFeatureAccess middleware first.',
        });
      }

      // ตรวจสอบว่าเปิดใช้ฟีเจอร์หรือไม่
      const pathParts = featurePath.split('.');
      let value = farm.featureAccess;

      for (const part of pathParts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }

      // ถ้าหา path ไม่เจอ หรือ enabled = false
      if (!value || !value.enabled) {
        return res.status(403).json({
          success: false,
          message: `Feature "${featurePath}" is not enabled for this farm`,
          code: 'FEATURE_NOT_ENABLED',
          hint: 'Please enable this feature in farm settings first',
        });
      }

      next();
    } catch (error) {
      console.error('Error checking feature enabled:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking if feature is enabled',
        error: error.message,
      });
    }
  };
}

/**
 * Helper: เปิดใช้งานฟีเจอร์สำหรับฟาร์ม
 */
async function enableFeature(farmId, featurePath) {
  const Farm = require('../models/Farm');
  const farm = await Farm.findById(farmId);

  if (!farm) {
    throw new Error('Farm not found');
  }

  // เช็คว่ามีสิทธิ์เข้าถึงฟีเจอร์หรือไม่
  const featureName = featurePath.split('.')[0];
  if (!hasFeatureAccess(farm, featureName)) {
    const tier = farm.subscription?.tier || 'free';
    throw new Error(`Feature not available in ${tier} tier. Please upgrade your subscription.`);
  }

  // เปิดใช้งานฟีเจอร์
  const updatePath = `featureAccess.${featurePath}.enabled`;
  const activatedAtPath = `featureAccess.${featurePath}.activatedAt`;

  await Farm.findByIdAndUpdate(farmId, {
    [updatePath]: true,
    [activatedAtPath]: new Date(),
  });

  return true;
}

/**
 * Helper: ปิดใช้งานฟีเจอร์
 */
async function disableFeature(farmId, featurePath) {
  const Farm = require('../models/Farm');
  const updatePath = `featureAccess.${featurePath}.enabled`;

  await Farm.findByIdAndUpdate(farmId, {
    [updatePath]: false,
  });

  return true;
}

module.exports = {
  SUBSCRIPTION_FEATURES,
  hasFeatureAccess,
  isSubscriptionActive,
  checkFeatureAccess,
  checkUsageLimit,
  requireFeatureEnabled,
  enableFeature,
  disableFeature,
  getRequiredTier,
};
