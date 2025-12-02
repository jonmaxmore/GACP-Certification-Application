# Phase 2: IoT & Smart Farming Foundation - Complete Implementation Guide

**GACP Platform - Botanical Audit Framework**
**Phase**: 2 - IoT & Smart Farming Foundation
**Status**: Implementation Guide
**Timeline**: 3 months (12 weeks)
**Budget**: 3,000,000 - 4,000,000 THB
**Team**: 5-6 people (2 Backend + 2 Frontend + 1 IoT Engineer + 1 DevOps)

**Prerequisites**: Phase 1 must be 100% complete ✅

---

## Table of Contents

1. [Overview](#overview)
2. [IoT Infrastructure](#iot-infrastructure)
3. [Device Management System](#device-management-system)
4. [Data Collection Pipeline](#data-collection-pipeline)
5. [Soil Monitoring Integration](#soil-monitoring-integration)
6. [Water Monitoring Integration](#water-monitoring-integration)
7. [Real-time Monitoring Dashboard](#real-time-monitoring-dashboard)
8. [Alert & Notification System](#alert--notification-system)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

---

## Overview

### Purpose

Phase 2 enables **real-time farm monitoring** through IoT sensors, transforming the GACP Platform from a certification system into a **Smart Farming Platform**. This phase focuses on soil and water monitoring to help farmers optimize growing conditions and maintain GACP compliance.

### Business Value

- **Precision Agriculture**: Data-driven farming decisions
- **Cost Savings**: Optimize water and fertilizer usage (save 20-30%)
- **Compliance Monitoring**: Real-time GACP standard compliance
- **Yield Improvement**: Better growing conditions = 15-25% higher yields
- **Early Problem Detection**: Prevent crop loss with instant alerts

### Key Objectives

1. **IoT Infrastructure** (Weeks 1-4)
   - MQTT broker setup
   - Device registration and management
   - Data ingestion pipeline
   - Redis caching layer

2. **Soil & Water Monitoring** (Weeks 5-8)
   - Sensor integration (pH, moisture, NPK, EC, TDS)
   - Real-time data collection
   - Alert rules engine
   - Historical data storage

3. **Real-time Dashboard** (Weeks 9-12)
   - Live sensor widgets
   - Trend charts and analytics
   - Alert management UI
   - Mobile-responsive design

### Success Criteria

- ✅ Support 10+ sensor types
- ✅ Handle 100,000+ readings/day
- ✅ Real-time updates (<5 sec latency)
- ✅ 99.9% data collection uptime
- ✅ Alerts delivered within 1 minute
- ✅ Mobile-responsive dashboard

---

## IoT Infrastructure

### Architecture Overview

```
┌─────────────────┐
│  IoT Devices    │
│  (Sensors)      │
└────────┬────────┘
         │ MQTT Protocol
         ▼
┌─────────────────┐
│  MQTT Broker    │
│  (EMQX/Mosquitto)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bridge Service │
│  (Node.js)      │
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│  MongoDB    │  │  Redis Cache │
│  (Storage)  │  │  (Latest)    │
└─────────────┘  └──────────────┘
         │              │
         └──────┬───────┘
                ▼
      ┌─────────────────┐
      │  WebSocket      │
      │  (Real-time UI) │
      └─────────────────┘
                │
                ▼
      ┌─────────────────┐
      │  Farmer         │
      │  Dashboard      │
      └─────────────────┘
```

### Technology Stack

**MQTT Broker**: EMQX (Enterprise) or Mosquitto (Open-source)

**Why MQTT?**

- Lightweight (minimal bandwidth)
- Built for IoT (billions of devices supported)
- Reliable (QoS levels 0, 1, 2)
- Pub/Sub pattern (scalable)
- Battery-friendly (low power consumption)

**Alternative Considered**: HTTP REST (rejected - too heavy for battery-powered sensors)

### MQTT Broker Setup

#### Option 1: EMQX (Recommended for Production)

**File**: `docker-compose.iot.yml`

```yaml
version: '3.8'

services:
  emqx:
    image: emqx/emqx:5.4.0
    container_name: gacp-emqx
    ports:
      - '1883:1883' # MQTT
      - '8883:8883' # MQTT/SSL
      - '8083:8083' # MQTT/WebSocket
      - '18083:18083' # Dashboard
    environment:
      - EMQX_NAME=emqx
      - EMQX_HOST=127.0.0.1
      - EMQX_DASHBOARD__DEFAULT_PASSWORD=admin123
      - EMQX_AUTH__USER__1__USERNAME=gacp_bridge
      - EMQX_AUTH__USER__1__PASSWORD=${MQTT_BRIDGE_PASSWORD}
    volumes:
      - ./emqx/data:/opt/emqx/data
      - ./emqx/log:/opt/emqx/log
      - ./emqx/etc:/opt/emqx/etc
    networks:
      - gacp-network
    restart: unless-stopped

  mqtt-bridge:
    build:
      context: ./apps/mqtt-bridge
      dockerfile: Dockerfile
    container_name: gacp-mqtt-bridge
    environment:
      - NODE_ENV=production
      - MQTT_BROKER=mqtt://emqx:1883
      - MQTT_USERNAME=gacp_bridge
      - MQTT_PASSWORD=${MQTT_BRIDGE_PASSWORD}
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - emqx
      - mongodb
      - redis
    networks:
      - gacp-network
    restart: unless-stopped

networks:
  gacp-network:
    driver: bridge
```

**Start EMQX**:

```bash
docker-compose -f docker-compose.iot.yml up -d

# Access EMQX Dashboard
# URL: http://localhost:18083
# Username: admin
# Password: admin123
```

#### Option 2: Mosquitto (For Development/Testing)

**File**: `mosquitto/mosquitto.conf`

```conf
# Basic Configuration
listener 1883 0.0.0.0
allow_anonymous false
password_file /mosquitto/config/passwd

# WebSocket Support
listener 8083
protocol websockets

# Logging
log_dest file /mosquitto/log/mosquitto.log
log_dest stdout
log_type all

# Persistence
persistence true
persistence_location /mosquitto/data/

# Authentication
allow_anonymous false
```

**Create Password File**:

```bash
# Create mosquitto user
docker run --rm -it eclipse-mosquitto mosquitto_passwd -c passwd gacp_bridge
# Enter password when prompted

# Move to config directory
mv passwd mosquitto/config/
```

**Docker Compose**:

```yaml
mosquitto:
  image: eclipse-mosquitto:2.0
  container_name: gacp-mosquitto
  ports:
    - '1883:1883'
    - '8083:8083'
  volumes:
    - ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf
    - ./mosquitto/data:/mosquitto/data
    - ./mosquitto/log:/mosquitto/log
    - ./mosquitto/config/passwd:/mosquitto/config/passwd
  networks:
    - gacp-network
  restart: unless-stopped
```

### MQTT Topic Structure

```
farm/{farmId}/device/{deviceId}/{sensorType}

Examples:
- farm/FARM001/device/SOIL001/moisture
- farm/FARM001/device/SOIL001/ph
- farm/FARM001/device/SOIL001/npk
- farm/FARM001/device/WATER001/ph
- farm/FARM001/device/WATER001/ec
- farm/FARM001/device/ENV001/temperature
- farm/FARM001/device/ENV001/humidity
```

**Topic Hierarchy**:

```
farm/                           (Root topic)
├── {farmId}/                   (Farm-specific)
│   ├── device/                 (All devices)
│   │   ├── {deviceId}/         (Specific device)
│   │   │   ├── moisture        (Sensor reading)
│   │   │   ├── ph
│   │   │   ├── temperature
│   │   │   ├── status          (Device status: online/offline)
│   │   │   └── battery         (Battery level)
│   │   └── ...
│   ├── alerts/                 (Farm alerts)
│   │   └── critical            (Critical alerts only)
│   └── commands/               (Commands to devices)
│       └── {deviceId}/config   (Configuration updates)
```

**Subscription Patterns**:

```javascript
// Bridge Service subscribes to all farm data
mqtt.subscribe('farm/+/device/+/+');

// Dashboard subscribes to specific farm
mqtt.subscribe(`farm/${farmId}/device/+/+`);
mqtt.subscribe(`farm/${farmId}/alerts/#`);

// Device subscribes to its commands
mqtt.subscribe(`farm/${farmId}/commands/${deviceId}/#`);
```

### MQTT Message Format

**Standard Sensor Reading**:

```json
{
  "deviceId": "SOIL001",
  "farmId": "FARM001",
  "sensorType": "moisture",
  "timestamp": "2025-01-27T12:30:45.123Z",
  "value": 65.5,
  "unit": "%",
  "quality": "good",
  "metadata": {
    "batteryLevel": 85,
    "signalStrength": -65,
    "firmwareVersion": "1.2.0",
    "calibrationDate": "2025-01-15"
  }
}
```

**NPK Sensor Reading** (Multiple values):

```json
{
  "deviceId": "SOIL002",
  "farmId": "FARM001",
  "sensorType": "npk",
  "timestamp": "2025-01-27T12:30:45.123Z",
  "values": {
    "nitrogen": { "value": 120, "unit": "ppm" },
    "phosphorus": { "value": 45, "unit": "ppm" },
    "potassium": { "value": 180, "unit": "ppm" }
  },
  "quality": "good",
  "metadata": {
    "batteryLevel": 80,
    "temperature": 28.5
  }
}
```

**Device Status Update**:

```json
{
  "deviceId": "SOIL001",
  "farmId": "FARM001",
  "status": "online",
  "timestamp": "2025-01-27T12:30:45.123Z",
  "batteryLevel": 85,
  "signalStrength": -65,
  "lastCalibration": "2025-01-15T09:00:00Z",
  "nextCalibration": "2025-04-15T09:00:00Z",
  "firmwareVersion": "1.2.0"
}
```

**Alert Message**:

```json
{
  "alertId": "ALERT-2025-001",
  "farmId": "FARM001",
  "deviceId": "SOIL001",
  "alertType": "low_moisture",
  "severity": "critical",
  "timestamp": "2025-01-27T12:30:45.123Z",
  "currentValue": 25,
  "threshold": 30,
  "message": "ความชื้นในดินต่ำ ควรให้น้ำทันที",
  "recommendation": "เปิดระบบรดน้ำหรือรดน้ำด้วยมือภายใน 6 ชั่วโมง"
}
```

---

## Device Management System

### Database Schema

**File**: `apps/backend/modules/iot/infrastructure/database/IoTDevice.model.js`

```javascript
const mongoose = require('mongoose');

const IoTDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    deviceType: {
      type: String,
      required: true,
      enum: [
        'soil_moisture',
        'soil_ph',
        'soil_npk',
        'soil_temperature',
        'soil_ec',
        'water_ph',
        'water_ec',
        'water_tds',
        'water_temperature',
        'water_do', // dissolved oxygen
        'environment_temperature',
        'environment_humidity',
        'environment_light',
        'environment_co2',
        'camera'
      ],
      index: true
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },

    location: {
      plotName: { type: String, required: true },
      gps: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      zone: String,
      depth: Number, // cm (for soil sensors)
      description: String
    },

    manufacturer: {
      name: String,
      model: String,
      serialNumber: String,
      manufactureDate: Date,
      warrantyExpiry: Date
    },

    firmware: {
      version: { type: String, default: '1.0.0' },
      lastUpdate: Date,
      updateAvailable: Boolean,
      releaseNotes: String
    },

    authentication: {
      apiKey: { type: String, required: true, unique: true },
      apiKeyExpiry: Date,
      mqttClientId: String,
      lastRotation: Date
    },

    status: {
      type: String,
      enum: ['active', 'offline', 'maintenance', 'error', 'disabled'],
      default: 'active',
      index: true
    },

    connectivity: {
      lastSeen: { type: Date, default: Date.now },
      lastData: Date,
      connectionType: {
        type: String,
        enum: ['wifi', 'ethernet', 'cellular', 'lora', 'zigbee']
      },
      signalStrength: Number, // dBm
      ipAddress: String,
      mqttConnected: { type: Boolean, default: false }
    },

    power: {
      batteryLevel: { type: Number, min: 0, max: 100 },
      batteryType: String,
      lastCharged: Date,
      powerSource: {
        type: String,
        enum: ['battery', 'solar', 'ac', 'hybrid']
      },
      lowBatteryAlert: { type: Boolean, default: false }
    },

    calibration: {
      lastCalibrated: Date,
      nextCalibration: Date,
      calibratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      calibrationCertificate: String,
      calibrationData: mongoose.Schema.Types.Mixed,
      accuracy: Number // %
    },

    configuration: {
      readingInterval: { type: Number, default: 300 }, // seconds
      transmissionInterval: { type: Number, default: 600 }, // seconds
      dataRetention: { type: Number, default: 90 }, // days

      // Alert thresholds (device-specific)
      thresholds: {
        moisture: { min: Number, max: Number },
        ph: { min: Number, max: Number },
        temperature: { min: Number, max: Number },
        npk: {
          nitrogen: { min: Number, max: Number },
          phosphorus: { min: Number, max: Number },
          potassium: { min: Number, max: Number }
        },
        ec: { min: Number, max: Number },
        tds: { min: Number, max: Number }
      },

      // Sensor-specific settings
      sensorSettings: mongoose.Schema.Types.Mixed
    },

    statistics: {
      totalReadings: { type: Number, default: 0 },
      failedReadings: { type: Number, default: 0 },
      lastReading: mongoose.Schema.Types.Mixed,
      uptime: Number, // hours
      dataQuality: { type: Number, min: 0, max: 100 } // %
    },

    maintenance: {
      lastMaintenance: Date,
      nextMaintenance: Date,
      maintenanceHistory: [
        {
          date: Date,
          type: String,
          performedBy: mongoose.Schema.Types.ObjectId,
          notes: String,
          cost: Number
        }
      ]
    },

    notes: String,
    tags: [String],
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Indexes
IoTDeviceSchema.index({ farmId: 1, deviceType: 1 });
IoTDeviceSchema.index({ status: 1, active: 1 });
IoTDeviceSchema.index({ 'connectivity.lastSeen': 1 });
IoTDeviceSchema.index({ 'calibration.nextCalibration': 1 });

// Virtual: Is device online?
IoTDeviceSchema.virtual('isOnline').get(function () {
  if (!this.connectivity.lastSeen) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.connectivity.lastSeen > fiveMinutesAgo;
});

// Virtual: Battery status
IoTDeviceSchema.virtual('batteryStatus').get(function () {
  if (!this.power.batteryLevel) return 'unknown';
  if (this.power.batteryLevel > 50) return 'good';
  if (this.power.batteryLevel > 20) return 'medium';
  return 'low';
});

// Virtual: Calibration status
IoTDeviceSchema.virtual('calibrationStatus').get(function () {
  if (!this.calibration.nextCalibration) return 'unknown';
  const now = new Date();
  const nextCalib = new Date(this.calibration.nextCalibration);

  if (now > nextCalib) return 'overdue';

  const daysUntilCalibration = Math.ceil((nextCalib - now) / (1000 * 60 * 60 * 24));
  if (daysUntilCalibration <= 7) return 'due_soon';

  return 'ok';
});

// Method: Update last seen
IoTDeviceSchema.methods.updateLastSeen = function () {
  this.connectivity.lastSeen = new Date();
  this.connectivity.mqttConnected = true;
  return this.save();
};

// Method: Record reading
IoTDeviceSchema.methods.recordReading = function (success = true) {
  this.statistics.totalReadings += 1;
  if (!success) {
    this.statistics.failedReadings += 1;
  }
  this.connectivity.lastData = new Date();
  return this.save();
};

// Method: Update battery
IoTDeviceSchema.methods.updateBattery = function (level) {
  this.power.batteryLevel = level;
  this.power.lowBatteryAlert = level < 20;
  return this.save();
};

// Method: Generate API key
IoTDeviceSchema.methods.generateApiKey = function () {
  const crypto = require('crypto');
  this.authentication.apiKey = crypto.randomBytes(32).toString('hex');
  this.authentication.lastRotation = new Date();
  this.authentication.apiKeyExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  return this.authentication.apiKey;
};

// Static: Find devices needing calibration
IoTDeviceSchema.statics.findNeedingCalibration = function (daysAhead = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);

  return this.find({
    active: true,
    'calibration.nextCalibration': { $lte: targetDate }
  }).populate('farmId');
};

// Static: Find low battery devices
IoTDeviceSchema.statics.findLowBattery = function (threshold = 20) {
  return this.find({
    active: true,
    'power.batteryLevel': { $lte: threshold }
  }).populate('farmId');
};

// Static: Find offline devices
IoTDeviceSchema.statics.findOffline = function (minutesThreshold = 10) {
  const cutoff = new Date(Date.now() - minutesThreshold * 60 * 1000);

  return this.find({
    active: true,
    status: { $ne: 'maintenance' },
    'connectivity.lastSeen': { $lt: cutoff }
  }).populate('farmId');
};

module.exports = mongoose.model('IoTDevice', IoTDeviceSchema);
```

### Sensor Readings Schema

**File**: `apps/backend/modules/iot/infrastructure/database/SensorReading.model.js`

```javascript
const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },

    sensorType: {
      type: String,
      required: true,
      enum: [
        'moisture',
        'ph',
        'npk',
        'temperature',
        'ec',
        'tds',
        'humidity',
        'light',
        'co2',
        'dissolved_oxygen'
      ],
      index: true
    },

    // Single value readings (moisture, pH, temperature, etc.)
    value: Number,
    unit: String,

    // Multi-value readings (NPK, etc.)
    values: mongoose.Schema.Types.Mixed,

    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'error'],
      default: 'good'
    },

    metadata: {
      batteryLevel: Number,
      signalStrength: Number,
      firmwareVersion: String,
      calibrationDate: Date,
      temperature: Number, // ambient temperature during reading
      humidity: Number // ambient humidity during reading
    },

    processed: {
      type: Boolean,
      default: false
    },

    alerts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IoTAlert'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
SensorReadingSchema.index({ deviceId: 1, timestamp: -1 });
SensorReadingSchema.index({ farmId: 1, sensorType: 1, timestamp: -1 });
SensorReadingSchema.index({ timestamp: -1, processed: 1 });

// TTL Index: Auto-delete readings older than 90 days
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static: Get latest reading for device
SensorReadingSchema.statics.getLatest = function (deviceId, sensorType = null) {
  const query = { deviceId };
  if (sensorType) query.sensorType = sensorType;

  return this.findOne(query).sort({ timestamp: -1 });
};

// Static: Get readings for time range
SensorReadingSchema.statics.getRange = function (deviceId, startDate, endDate, sensorType = null) {
  const query = {
    deviceId,
    timestamp: { $gte: startDate, $lte: endDate }
  };

  if (sensorType) query.sensorType = sensorType;

  return this.find(query).sort({ timestamp: 1 });
};

// Static: Get statistics
SensorReadingSchema.statics.getStats = function (deviceId, sensorType, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        deviceId,
        sensorType,
        timestamp: { $gte: since },
        quality: { $in: ['excellent', 'good', 'fair'] }
      }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: '$value' },
        min: { $min: '$value' },
        max: { $max: '$value' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static: Bulk insert (for high-frequency data)
SensorReadingSchema.statics.bulkInsertReadings = function (readings) {
  return this.insertMany(readings, { ordered: false });
};

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
```

### Device Registration API

**File**: `apps/backend/modules/iot/application/controllers/device.controller.js`

```javascript
const IoTDevice = require('../../infrastructure/database/IoTDevice.model');
const Farm = require('../../../farm-management/infrastructure/database/Farm.model');
const { logger } = require('../../../../shared/utils/logger');
const ApiResponse = require('../../../../shared/utils/api-response');

/**
 * Register new IoT device
 */
exports.registerDevice = async (req, res) => {
  try {
    const { deviceId, deviceType, farmId, location, manufacturer, firmware, configuration } =
      req.body;

    // Validate farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    // Check if device already exists
    const existing = await IoTDevice.findOne({ deviceId });
    if (existing) {
      return res.status(409).json(ApiResponse.error('Device already registered', 409));
    }

    // Create device
    const device = new IoTDevice({
      deviceId,
      deviceType,
      farmId,
      location,
      manufacturer,
      firmware,
      configuration: configuration || {},
      status: 'active'
    });

    // Generate API key
    const apiKey = device.generateApiKey();

    await device.save();

    logger.info('IoT device registered', {
      deviceId,
      farmId,
      deviceType,
      userId: req.user.id
    });

    res.status(201).json(
      ApiResponse.success({
        device: device.toJSON(),
        apiKey, // Return API key only once during registration
        mqttConfig: {
          broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
          clientId: device.authentication.mqttClientId || deviceId,
          topic: `farm/${farm.farmNumber}/device/${deviceId}/+`
        }
      })
    );
  } catch (error) {
    logger.error('Failed to register device', {
      error: error.message,
      userId: req.user.id
    });

    res.status(500).json(ApiResponse.error('Failed to register device', 500, error.message));
  }
};

/**
 * Get all devices for a farm
 */
exports.getFarmDevices = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { deviceType, status, active = true } = req.query;

    // Build query
    const query = { farmId };
    if (deviceType) query.deviceType = deviceType;
    if (status) query.status = status;
    if (active !== undefined) query.active = active === 'true';

    const devices = await IoTDevice.find(query)
      .populate('farmId', 'farmName farmNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Add virtual fields
    const enrichedDevices = devices.map(device => ({
      ...device,
      isOnline: device.connectivity.lastSeen > new Date(Date.now() - 5 * 60 * 1000),
      batteryStatus:
        device.power.batteryLevel > 50 ? 'good' : device.power.batteryLevel > 20 ? 'medium' : 'low'
    }));

    res.json(ApiResponse.success(enrichedDevices));
  } catch (error) {
    logger.error('Failed to get farm devices', { error: error.message, farmId: req.params.farmId });
    res.status(500).json(ApiResponse.error('Failed to get devices', 500, error.message));
  }
};

/**
 * Get device details
 */
exports.getDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await IoTDevice.findOne({ deviceId })
      .populate('farmId', 'farmName farmNumber province district')
      .lean();

    if (!device) {
      return res.status(404).json(ApiResponse.error('Device not found', 404));
    }

    // Get latest readings
    const SensorReading = require('../../infrastructure/database/SensorReading.model');
    const latestReading = await SensorReading.getLatest(deviceId);

    // Get 24-hour stats
    const stats = await SensorReading.getStats(deviceId, device.sensorType || 'moisture', 24);

    res.json(
      ApiResponse.success({
        device: {
          ...device,
          isOnline: device.connectivity.lastSeen > new Date(Date.now() - 5 * 60 * 1000)
        },
        latestReading,
        stats: stats[0] || null
      })
    );
  } catch (error) {
    logger.error('Failed to get device', { error: error.message, deviceId: req.params.deviceId });
    res.status(500).json(ApiResponse.error('Failed to get device', 500, error.message));
  }
};

/**
 * Update device configuration
 */
exports.updateDeviceConfig = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { configuration } = req.body;

    const device = await IoTDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json(ApiResponse.error('Device not found', 404));
    }

    // Update configuration
    device.configuration = {
      ...device.configuration,
      ...configuration
    };

    await device.save();

    // Publish configuration update to MQTT (device will receive and apply)
    const mqtt = require('../../../../shared/mqtt/client');
    const farm = await Farm.findById(device.farmId);

    mqtt.publish(
      `farm/${farm.farmNumber}/commands/${deviceId}/config`,
      JSON.stringify(device.configuration)
    );

    logger.info('Device configuration updated', {
      deviceId,
      userId: req.user.id
    });

    res.json(ApiResponse.success(device));
  } catch (error) {
    logger.error('Failed to update device config', {
      error: error.message,
      deviceId: req.params.deviceId
    });
    res.status(500).json(ApiResponse.error('Failed to update configuration', 500, error.message));
  }
};

/**
 * Record device calibration
 */
exports.recordCalibration = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { calibrationData, accuracy, certificate, nextCalibrationDays = 90 } = req.body;

    const device = await IoTDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json(ApiResponse.error('Device not found', 404));
    }

    // Update calibration
    const now = new Date();
    const nextCalibration = new Date(now.getTime() + nextCalibrationDays * 24 * 60 * 60 * 1000);

    device.calibration = {
      lastCalibrated: now,
      nextCalibration,
      calibratedBy: req.user.id,
      calibrationData,
      accuracy,
      calibrationCertificate: certificate
    };

    await device.save();

    logger.info('Device calibrated', {
      deviceId,
      calibratedBy: req.user.id,
      nextCalibration
    });

    res.json(
      ApiResponse.success({
        device,
        message: `อุปกรณ์ได้รับการสอบเทียบแล้ว กำหนดสอบเทียบครั้งถัดไป: ${nextCalibration.toLocaleDateString(
          'th-TH'
        )}`
      })
    );
  } catch (error) {
    logger.error('Failed to record calibration', {
      error: error.message,
      deviceId: req.params.deviceId
    });
    res.status(500).json(ApiResponse.error('Failed to record calibration', 500, error.message));
  }
};

/**
 * Deactivate device
 */
exports.deactivateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { reason } = req.body;

    const device = await IoTDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json(ApiResponse.error('Device not found', 404));
    }

    device.active = false;
    device.status = 'disabled';
    device.notes = `Deactivated: ${reason || 'No reason provided'}`;

    await device.save();

    logger.info('Device deactivated', {
      deviceId,
      reason,
      userId: req.user.id
    });

    res.json(
      ApiResponse.success({
        device,
        message: 'อุปกรณ์ถูกปิดการใช้งานแล้ว'
      })
    );
  } catch (error) {
    logger.error('Failed to deactivate device', {
      error: error.message,
      deviceId: req.params.deviceId
    });
    res.status(500).json(ApiResponse.error('Failed to deactivate device', 500, error.message));
  }
};

/**
 * Get devices needing maintenance
 */
exports.getMaintenanceNeeded = async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    const results = {};

    if (type === 'all' || type === 'calibration') {
      results.calibration = await IoTDevice.findNeedingCalibration(7);
    }

    if (type === 'all' || type === 'battery') {
      results.battery = await IoTDevice.findLowBattery(20);
    }

    if (type === 'all' || type === 'offline') {
      results.offline = await IoTDevice.findOffline(10);
    }

    res.json(ApiResponse.success(results));
  } catch (error) {
    logger.error('Failed to get maintenance needed', { error: error.message });
    res.status(500).json(ApiResponse.error('Failed to get maintenance info', 500, error.message));
  }
};
```

### Device Management Routes

**File**: `apps/backend/modules/iot/routes/device.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const deviceController = require('../application/controllers/device.controller');
const { authenticate } = require('../../../shared/middleware/auth');
const { authorize } = require('../../../shared/middleware/authorize');
const { validationRules, handleValidationErrors } = require('../../../shared/validators/common');
const { body, param } = require('express-validator');

// Device registration validation
const registerDeviceRules = [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('deviceType').isIn([
    'soil_moisture',
    'soil_ph',
    'soil_npk',
    'soil_temperature',
    'soil_ec',
    'water_ph',
    'water_ec',
    'water_tds',
    'water_temperature',
    'water_do',
    'environment_temperature',
    'environment_humidity',
    'environment_light',
    'environment_co2',
    'camera'
  ]),
  body('farmId').isMongoId().withMessage('Invalid farm ID'),
  body('location.plotName').notEmpty().withMessage('Plot name is required'),
  body('location.gps.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.gps.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  handleValidationErrors
];

// Routes
router.post(
  '/devices/register',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  registerDeviceRules,
  deviceController.registerDevice
);

router.get(
  '/devices/farm/:farmId',
  authenticate,
  param('farmId').isMongoId(),
  handleValidationErrors,
  deviceController.getFarmDevices
);

router.get(
  '/devices/:deviceId',
  authenticate,
  param('deviceId').notEmpty(),
  handleValidationErrors,
  deviceController.getDevice
);

router.put(
  '/devices/:deviceId/config',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  param('deviceId').notEmpty(),
  body('configuration').isObject(),
  handleValidationErrors,
  deviceController.updateDeviceConfig
);

router.post(
  '/devices/:deviceId/calibrate',
  authenticate,
  authorize(['INSPECTOR', 'ADMIN']),
  param('deviceId').notEmpty(),
  body('accuracy').isFloat({ min: 0, max: 100 }).optional(),
  handleValidationErrors,
  deviceController.recordCalibration
);

router.delete(
  '/devices/:deviceId',
  authenticate,
  authorize(['ADMIN']),
  param('deviceId').notEmpty(),
  handleValidationErrors,
  deviceController.deactivateDevice
);

router.get(
  '/devices/maintenance/needed',
  authenticate,
  authorize(['ADMIN', 'INSPECTOR']),
  deviceController.getMaintenanceNeeded
);

module.exports = router;
```

---

## Data Collection Pipeline

### MQTT Bridge Service

The MQTT Bridge Service acts as the translator between IoT devices (publishing to MQTT) and the backend API (storing to MongoDB).

**File**: `apps/mqtt-bridge/index.js`

```javascript
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const { logger } = require('../backend/shared/utils/logger');

// Models
const SensorReading = require('../backend/modules/iot/infrastructure/database/SensorReading.model');
const IoTDevice = require('../backend/modules/iot/infrastructure/database/IoTDevice.model');
const IoTAlert = require('../backend/modules/iot/infrastructure/database/IoTAlert.model');

// Configuration
const config = {
  mqtt: {
    broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: `gacp-bridge-${Date.now()}`
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
};

class MQTTBridgeService {
  constructor() {
    this.mqttClient = null;
    this.redisClient = null;
    this.buffer = [];
    this.bufferSize = 100;
    this.flushInterval = 10000; // 10 seconds
  }

  async start() {
    try {
      // Connect to MongoDB
      await mongoose.connect(config.mongodb.uri);
      logger.info('Connected to MongoDB');

      // Connect to Redis
      this.redisClient = new Redis(config.redis);
      logger.info('Connected to Redis');

      // Connect to MQTT Broker
      this.mqttClient = mqtt.connect(config.mqtt.broker, {
        clientId: config.mqtt.clientId,
        username: config.mqtt.username,
        password: config.mqtt.password,
        clean: false, // Persistent session
        reconnectPeriod: 5000,
        connectTimeout: 30000
      });

      this.setupMQTTHandlers();
      this.startBufferFlusher();

      logger.info('MQTT Bridge Service started');
    } catch (error) {
      logger.error('Failed to start MQTT Bridge Service', { error: error.message });
      process.exit(1);
    }
  }

  setupMQTTHandlers() {
    this.mqttClient.on('connect', () => {
      logger.info('Connected to MQTT Broker');

      // Subscribe to all sensor data
      this.mqttClient.subscribe('farm/+/device/+/+', { qos: 1 }, err => {
        if (err) {
          logger.error('Failed to subscribe to topics', { error: err.message });
        } else {
          logger.info('Subscribed to farm/+/device/+/+');
        }
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      try {
        await this.handleMessage(topic, message.toString());
      } catch (error) {
        logger.error('Failed to handle MQTT message', {
          topic,
          error: error.message
        });
      }
    });

    this.mqttClient.on('error', error => {
      logger.error('MQTT error', { error: error.message });
    });

    this.mqttClient.on('reconnect', () => {
      logger.warn('Reconnecting to MQTT Broker');
    });

    this.mqttClient.on('offline', () => {
      logger.warn('MQTT client offline');
    });
  }

  async handleMessage(topic, messageStr) {
    const parts = topic.split('/');
    // Expected: farm/{farmNumber}/device/{deviceId}/{sensorType}

    if (parts.length !== 5 || parts[0] !== 'farm' || parts[2] !== 'device') {
      logger.warn('Invalid topic format', { topic });
      return;
    }

    const farmNumber = parts[1];
    const deviceId = parts[3];
    const sensorType = parts[4];

    // Parse message
    let data;
    try {
      data = JSON.parse(messageStr);
    } catch (error) {
      logger.error('Failed to parse MQTT message', { topic, error: error.message });
      return;
    }

    // Handle different message types
    if (sensorType === 'status') {
      await this.handleDeviceStatus(deviceId, data);
    } else if (sensorType === 'battery') {
      await this.handleBatteryUpdate(deviceId, data);
    } else {
      // Sensor reading
      await this.handleSensorReading(deviceId, sensorType, data);
    }
  }

  async handleDeviceStatus(deviceId, data) {
    try {
      const device = await IoTDevice.findOne({ deviceId });
      if (!device) {
        logger.warn('Device not found', { deviceId });
        return;
      }

      device.connectivity.lastSeen = new Date();
      device.connectivity.mqttConnected = data.status === 'online';
      device.connectivity.signalStrength = data.signalStrength;

      if (data.firmwareVersion) {
        device.firmware.version = data.firmwareVersion;
      }

      await device.save();

      logger.debug('Device status updated', { deviceId, status: data.status });
    } catch (error) {
      logger.error('Failed to handle device status', {
        deviceId,
        error: error.message
      });
    }
  }

  async handleBatteryUpdate(deviceId, data) {
    try {
      const device = await IoTDevice.findOne({ deviceId });
      if (!device) return;

      await device.updateBattery(data.batteryLevel);

      // Check if low battery alert needed
      if (data.batteryLevel < 20 && !device.power.lowBatteryAlert) {
        await this.createAlert({
          deviceId,
          farmId: device.farmId,
          alertType: 'low_battery',
          severity: 'warning',
          message: `แบตเตอรี่ของเซ็นเซอร์เหลือ ${data.batteryLevel}%`,
          currentValue: data.batteryLevel,
          threshold: 20
        });
      }

      logger.debug('Battery updated', { deviceId, level: data.batteryLevel });
    } catch (error) {
      logger.error('Failed to handle battery update', {
        deviceId,
        error: error.message
      });
    }
  }

  async handleSensorReading(deviceId, sensorType, data) {
    try {
      // Get device info
      const device = await IoTDevice.findOne({ deviceId });
      if (!device) {
        logger.warn('Device not found for reading', { deviceId });
        return;
      }

      // Create sensor reading record
      const reading = {
        deviceId,
        farmId: device.farmId,
        sensorType,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        value: data.value,
        values: data.values,
        unit: data.unit,
        quality: data.quality || 'good',
        metadata: data.metadata || {}
      };

      // Add to buffer for bulk insert
      this.buffer.push(reading);

      // Update device statistics
      await device.recordReading(true);
      await device.updateLastSeen();

      // Cache latest reading in Redis (for fast dashboard access)
      await this.cacheLatestReading(deviceId, sensorType, reading);

      // Check alert thresholds
      await this.checkAlertThresholds(device, reading);

      // Publish to WebSocket for real-time dashboard
      await this.publishToWebSocket(device.farmId, deviceId, sensorType, reading);

      logger.debug('Sensor reading processed', {
        deviceId,
        sensorType,
        value: data.value
      });

      // Flush buffer if full
      if (this.buffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }
    } catch (error) {
      logger.error('Failed to handle sensor reading', {
        deviceId,
        sensorType,
        error: error.message
      });
    }
  }

  async cacheLatestReading(deviceId, sensorType, reading) {
    try {
      const key = `sensor:latest:${deviceId}:${sensorType}`;
      await this.redisClient.setex(key, 3600, JSON.stringify(reading)); // Cache for 1 hour
    } catch (error) {
      logger.error('Failed to cache reading', { error: error.message });
    }
  }

  async checkAlertThresholds(device, reading) {
    try {
      const { sensorType, value, values } = reading;
      const thresholds = device.configuration.thresholds || {};

      let alerts = [];

      // Check single value thresholds
      if (value !== undefined && thresholds[sensorType]) {
        const { min, max } = thresholds[sensorType];

        if (min !== undefined && value < min) {
          alerts.push({
            alertType: `low_${sensorType}`,
            severity: this.getSeverity(sensorType, 'low'),
            message: `${this.getSensorName(sensorType)}ต่ำ (${value} ${reading.unit})`,
            currentValue: value,
            threshold: min
          });
        }

        if (max !== undefined && value > max) {
          alerts.push({
            alertType: `high_${sensorType}`,
            severity: this.getSeverity(sensorType, 'high'),
            message: `${this.getSensorName(sensorType)}สูง (${value} ${reading.unit})`,
            currentValue: value,
            threshold: max
          });
        }
      }

      // Check NPK thresholds
      if (sensorType === 'npk' && values && thresholds.npk) {
        ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
          const val = values[nutrient]?.value;
          const thresh = thresholds.npk[nutrient];

          if (val !== undefined && thresh) {
            if (thresh.min !== undefined && val < thresh.min) {
              alerts.push({
                alertType: `low_${nutrient}`,
                severity: 'warning',
                message: `${nutrient} ในดินต่ำ (${val} ppm)`,
                currentValue: val,
                threshold: thresh.min
              });
            }

            if (thresh.max !== undefined && val > thresh.max) {
              alerts.push({
                alertType: `high_${nutrient}`,
                severity: 'info',
                message: `${nutrient} ในดินสูง (${val} ppm)`,
                currentValue: val,
                threshold: thresh.max
              });
            }
          }
        });
      }

      // Create alerts
      for (const alert of alerts) {
        await this.createAlert({
          deviceId: device.deviceId,
          farmId: device.farmId,
          ...alert
        });
      }
    } catch (error) {
      logger.error('Failed to check alert thresholds', { error: error.message });
    }
  }

  async createAlert(alertData) {
    try {
      const alert = new IoTAlert(alertData);
      await alert.save();

      // Publish alert to MQTT for real-time notifications
      const Farm = require('../backend/modules/farm-management/infrastructure/database/Farm.model');
      const farm = await Farm.findById(alertData.farmId);

      if (farm) {
        this.mqttClient.publish(
          `farm/${farm.farmNumber}/alerts/${alertData.severity}`,
          JSON.stringify(alert)
        );
      }

      logger.info('Alert created', {
        deviceId: alertData.deviceId,
        alertType: alertData.alertType,
        severity: alertData.severity
      });
    } catch (error) {
      logger.error('Failed to create alert', { error: error.message });
    }
  }

  async publishToWebSocket(farmId, deviceId, sensorType, reading) {
    try {
      // Publish to Redis pub/sub (WebSocket server subscribes to this)
      await this.redisClient.publish(
        'sensor:reading',
        JSON.stringify({
          farmId,
          deviceId,
          sensorType,
          reading
        })
      );
    } catch (error) {
      logger.error('Failed to publish to WebSocket', { error: error.message });
    }
  }

  async flushBuffer() {
    if (this.buffer.length === 0) return;

    try {
      await SensorReading.bulkInsertReadings([...this.buffer]);

      logger.info('Buffer flushed', { count: this.buffer.length });

      this.buffer = [];
    } catch (error) {
      logger.error('Failed to flush buffer', { error: error.message });
    }
  }

  startBufferFlusher() {
    setInterval(() => {
      if (this.buffer.length > 0) {
        this.flushBuffer();
      }
    }, this.flushInterval);
  }

  getSensorName(sensorType) {
    const names = {
      moisture: 'ความชื้นในดิน',
      ph: 'ค่า pH',
      temperature: 'อุณหภูมิ',
      ec: 'ค่า EC',
      tds: 'ค่า TDS',
      humidity: 'ความชื้นในอากาศ'
    };
    return names[sensorType] || sensorType;
  }

  getSeverity(sensorType, direction) {
    // Critical thresholds
    if (sensorType === 'moisture' && direction === 'low') return 'critical';
    if (sensorType === 'temperature' && direction === 'high') return 'critical';
    if (sensorType === 'ph' && (direction === 'low' || direction === 'high')) return 'warning';

    return 'info';
  }
}

// Start service
const service = new MQTTBridgeService();
service.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down MQTT Bridge Service');

  if (service.buffer.length > 0) {
    await service.flushBuffer();
  }

  if (service.mqttClient) {
    service.mqttClient.end();
  }

  if (service.redisClient) {
    service.redisClient.disconnect();
  }

  await mongoose.connection.close();

  process.exit(0);
});
```

**File**: `apps/mqtt-bridge/package.json`

```json
{
  "name": "gacp-mqtt-bridge",
  "version": "1.0.0",
  "description": "MQTT Bridge Service for GACP IoT Platform",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "mqtt": "^5.3.5",
    "mongoose": "^8.0.3",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**File**: `apps/mqtt-bridge/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "index.js"]
```

---

## Soil Monitoring Integration

### Supported Soil Sensors

**1. Soil Moisture Sensor**

- **Range**: 0-100%
- **Accuracy**: ±3%
- **Recommended Models**:
  - Capacitive Soil Moisture Sensor v1.2
  - VH400 Soil Moisture Sensor
  - EC-5 Small Soil Moisture Sensor

**2. Soil pH Sensor**

- **Range**: 3-10 pH
- **Accuracy**: ±0.1 pH
- **Recommended Models**:
  - pH-4502C pH Sensor Kit
  - Atlas Scientific pH Sensor
  - DFRobot Gravity Analog pH Sensor

**3. NPK Sensor (Nitrogen, Phosphorus, Potassium)**

- **Range**: 0-1999 mg/kg (ppm)
- **Accuracy**: ±2%
- **Recommended Models**:
  - RS485 NPK Sensor
  - 3-in-1 NPK Soil Sensor
  - Modbus NPK Detector

**4. Soil Temperature Sensor**

- **Range**: -40°C to 80°C
- **Accuracy**: ±0.5°C
- **Recommended Models**:
  - DS18B20 Waterproof Temperature Sensor
  - PT100 Soil Temperature Probe

**5. Soil EC Sensor (Electrical Conductivity)**

- **Range**: 0-20 mS/cm
- **Accuracy**: ±2%
- **Recommended Models**:
  - Atlas Scientific EC Sensor
  - DFRobot Analog EC Sensor

### Soil Monitoring Database Schema

**Add to Farm Model**: `apps/backend/modules/farm-management/infrastructure/database/Farm.model.js`

```javascript
// Add to existing Farm schema
soilMonitoring: {
  enabled: { type: Boolean, default: false },

  sensors: [{
    deviceId: { type: String, ref: 'IoTDevice' },
    plotName: String,
    soilType: {
      type: String,
      enum: ['sandy', 'clay', 'loam', 'silt', 'peat', 'chalk', 'mixed']
    },
    depth: Number, // cm
    installDate: Date,
    active: { type: Boolean, default: true }
  }],

  // Current real-time data (from latest sensor readings)
  realTimeData: {
    moisture: {
      current: Number,
      optimal: { min: { type: Number, default: 40 }, max: { type: Number, default: 60 } },
      unit: { type: String, default: '%' },
      lastUpdated: Date,
      status: { type: String, enum: ['good', 'low', 'high', 'critical'] }
    },

    ph: {
      current: Number,
      optimal: { min: { type: Number, default: 6.0 }, max: { type: Number, default: 7.0 } },
      lastUpdated: Date,
      status: { type: String, enum: ['good', 'acidic', 'alkaline'] }
    },

    temperature: {
      current: Number,
      optimal: { min: { type: Number, default: 20 }, max: { type: Number, default: 30 } },
      unit: { type: String, default: 'C' },
      lastUpdated: Date
    },

    npk: {
      nitrogen: {
        current: Number,
        optimal: { min: { type: Number, default: 80 }, max: { type: Number, default: 150 } },
        unit: { type: String, default: 'ppm' },
        status: { type: String, enum: ['deficient', 'adequate', 'excessive'] }
      },
      phosphorus: {
        current: Number,
        optimal: { min: { type: Number, default: 30 }, max: { type: Number, default: 70 } },
        unit: { type: String, default: 'ppm' },
        status: { type: String, enum: ['deficient', 'adequate', 'excessive'] }
      },
      potassium: {
        current: Number,
        optimal: { min: { type: Number, default: 120 }, max: { type: Number, default: 200 } },
        unit: { type: String, default: 'ppm' },
        status: { type: String, enum: ['deficient', 'adequate', 'excessive'] }
      },
      lastUpdated: Date
    },

    ec: {
      current: Number,
      optimal: { min: { type: Number, default: 0.8 }, max: { type: Number, default: 2.0 } },
      unit: { type: String, default: 'mS/cm' },
      lastUpdated: Date
    }
  },

  // Alert history
  alerts: [{
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'IoTAlert' },
    type: String,
    severity: String,
    message: String,
    timestamp: Date,
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: mongoose.Schema.Types.ObjectId,
    acknowledgedAt: Date
  }],

  // Manual lab test results
  manualTests: [{
    testDate: Date,
    labName: String,
    labCertification: String,

    npk: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number
    },

    micronutrients: {
      calcium: Number,
      magnesium: Number,
      sulfur: Number,
      iron: Number,
      zinc: Number,
      manganese: Number,
      copper: Number,
      boron: Number
    },

    organicMatter: Number, // %
    cec: Number, // Cation Exchange Capacity (cmol/kg)

    recommendations: String,
    certificate: String, // PDF URL
    uploadedBy: mongoose.Schema.Types.ObjectId,
    verified: { type: Boolean, default: false }
  }],

  // Soil improvement history
  improvements: [{
    date: Date,
    type: {
      type: String,
      enum: ['fertilizer', 'lime', 'sulfur', 'compost', 'manure', 'mulch', 'other']
    },
    product: String,
    amount: Number,
    unit: String,
    targetNutrient: String,
    cost: Number,
    appliedBy: mongoose.Schema.Types.ObjectId,
    notes: String,
    beforePH: Number,
    afterPH: Number,
    effectiveDate: Date
  }]
}
```

### Soil Monitoring API

**File**: `apps/backend/modules/iot/application/controllers/soil.controller.js`

```javascript
const Farm = require('../../../farm-management/infrastructure/database/Farm.model');
const SensorReading = require('../../infrastructure/database/SensorReading.model');
const IoTDevice = require('../../infrastructure/database/IoTDevice.model');
const { logger } = require('../../../../shared/utils/logger');
const ApiResponse = require('../../../../shared/utils/api-response');

/**
 * Get current soil conditions for a farm
 */
exports.getSoilConditions = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId).select('soilMonitoring farmName farmNumber').lean();

    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    // Get latest readings from all soil sensors
    const soilDevices = await IoTDevice.find({
      farmId,
      deviceType: { $in: ['soil_moisture', 'soil_ph', 'soil_npk', 'soil_temperature', 'soil_ec'] },
      active: true
    });

    const latestReadings = await Promise.all(
      soilDevices.map(async device => {
        const reading = await SensorReading.getLatest(device.deviceId);
        return {
          device: {
            deviceId: device.deviceId,
            type: device.deviceType,
            plotName: device.location.plotName,
            depth: device.location.depth
          },
          reading
        };
      })
    );

    res.json(
      ApiResponse.success({
        farm: {
          farmId: farm._id,
          farmName: farm.farmName,
          farmNumber: farm.farmNumber
        },
        realTimeData: farm.soilMonitoring?.realTimeData || {},
        sensors: latestReadings,
        alerts: farm.soilMonitoring?.alerts?.slice(0, 10) || []
      })
    );
  } catch (error) {
    logger.error('Failed to get soil conditions', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('Failed to get soil conditions', 500, error.message));
  }
};

/**
 * Get soil data history
 */
exports.getSoilHistory = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { sensorType = 'moisture', hours = 24, deviceId } = req.query;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    // Build query
    const query = {
      farmId,
      sensorType: sensorType === 'npk' ? 'npk' : sensorType,
      timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
    };

    if (deviceId) {
      query.deviceId = deviceId;
    }

    const readings = await SensorReading.find(query).sort({ timestamp: 1 }).limit(1000).lean();

    // Calculate statistics
    const stats = {
      avg: 0,
      min: Infinity,
      max: -Infinity,
      count: readings.length
    };

    readings.forEach(reading => {
      const value = reading.value || reading.values?.nitrogen?.value || 0;
      stats.avg += value;
      stats.min = Math.min(stats.min, value);
      stats.max = Math.max(stats.max, value);
    });

    if (stats.count > 0) {
      stats.avg = stats.avg / stats.count;
    }

    res.json(
      ApiResponse.success({
        readings,
        stats,
        period: { hours, from: query.timestamp.$gte, to: new Date() }
      })
    );
  } catch (error) {
    logger.error('Failed to get soil history', { error: error.message, farmId: req.params.farmId });
    res.status(500).json(ApiResponse.error('Failed to get soil history', 500, error.message));
  }
};

/**
 * Submit manual lab test results
 */
exports.submitLabTest = async (req, res) => {
  try {
    const { farmId } = req.params;
    const {
      testDate,
      labName,
      labCertification,
      npk,
      micronutrients,
      organicMatter,
      cec,
      recommendations,
      certificate
    } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    // Add lab test result
    if (!farm.soilMonitoring) {
      farm.soilMonitoring = {
        enabled: true,
        sensors: [],
        realTimeData: {},
        alerts: [],
        manualTests: [],
        improvements: []
      };
    }

    farm.soilMonitoring.manualTests.push({
      testDate: new Date(testDate),
      labName,
      labCertification,
      npk,
      micronutrients,
      organicMatter,
      cec,
      recommendations,
      certificate,
      uploadedBy: req.user.id,
      verified: false
    });

    await farm.save();

    logger.info('Lab test submitted', {
      farmId,
      labName,
      userId: req.user.id
    });

    res.status(201).json(
      ApiResponse.success({
        message: 'ผลการทดสอบดินจากห้องปฏิบัติการถูกบันทึกแล้ว',
        test: farm.soilMonitoring.manualTests[farm.soilMonitoring.manualTests.length - 1]
      })
    );
  } catch (error) {
    logger.error('Failed to submit lab test', { error: error.message, farmId: req.params.farmId });
    res.status(500).json(ApiResponse.error('Failed to submit lab test', 500, error.message));
  }
};

/**
 * Record soil improvement action
 */
exports.recordSoilImprovement = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { date, type, product, amount, unit, targetNutrient, cost, notes, beforePH, afterPH } =
      req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    if (!farm.soilMonitoring) {
      farm.soilMonitoring = {
        enabled: true,
        sensors: [],
        realTimeData: {},
        alerts: [],
        manualTests: [],
        improvements: []
      };
    }

    farm.soilMonitoring.improvements.push({
      date: new Date(date),
      type,
      product,
      amount,
      unit,
      targetNutrient,
      cost,
      appliedBy: req.user.id,
      notes,
      beforePH,
      afterPH,
      effectiveDate: new Date(date)
    });

    await farm.save();

    logger.info('Soil improvement recorded', {
      farmId,
      type,
      product,
      userId: req.user.id
    });

    res.status(201).json(
      ApiResponse.success({
        message: 'บันทึกการปรับปรุงดินเรียบร้อยแล้ว',
        improvement: farm.soilMonitoring.improvements[farm.soilMonitoring.improvements.length - 1]
      })
    );
  } catch (error) {
    logger.error('Failed to record soil improvement', {
      error: error.message,
      farmId: req.params.farmId
    });
    res
      .status(500)
      .json(ApiResponse.error('Failed to record soil improvement', 500, error.message));
  }
};

/**
 * Get soil recommendations based on current conditions
 */
exports.getSoilRecommendations = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId).select('soilMonitoring crops');
    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    const soilData = farm.soilMonitoring?.realTimeData || {};
    const recommendations = [];

    // pH recommendations
    if (soilData.ph?.current) {
      const ph = soilData.ph.current;

      if (ph < 6.0) {
        recommendations.push({
          priority: 'high',
          category: 'pH',
          issue: 'ดินเป็นกรดเกินไป',
          currentValue: ph,
          targetValue: '6.0-7.0',
          solution: 'ปูนขาว (Calcium Carbonate)',
          amount: `${Math.ceil((6.5 - ph) * 500)} กก./ไร่`,
          method: 'โรยทั่วแปลง พรวนดินให้เข้ากัน',
          frequency: 'ครั้งเดียว แล้วรอ 2-4 สัปดาห์ ก่อนวัด pH อีกครั้ง',
          cost: `${Math.ceil((6.5 - ph) * 500 * 15)} บาท`,
          benefit: 'ช่วยให้พืชดูดซึมธาตุอาหารได้ดีขึ้น เพิ่มกิจกรรมของจุลินทรีย์ในดิน'
        });
      } else if (ph > 7.5) {
        recommendations.push({
          priority: 'high',
          category: 'pH',
          issue: 'ดินเป็นด่างเกินไป',
          currentValue: ph,
          targetValue: '6.0-7.0',
          solution: 'กำมะถัน (Sulfur) หรือ Peat Moss',
          amount: `${Math.ceil((ph - 6.5) * 300)} กก./ไร่`,
          method: 'ผสมดิน รดน้ำให้ชุ่ม',
          frequency: 'ครั้งเดียว รอ 3-4 สัปดาห์',
          cost: `${Math.ceil((ph - 6.5) * 300 * 25)} บาท`,
          benefit: 'ลด pH ให้เหมาะสม เพิ่มการดูดซึมธาตุเหล็กและแมงกานีส'
        });
      }
    }

    // NPK recommendations
    if (soilData.npk) {
      const { nitrogen, phosphorus, potassium } = soilData.npk;

      if (nitrogen?.current < 80) {
        recommendations.push({
          priority: 'medium',
          category: 'Nitrogen',
          issue: 'ไนโตรเจนในดินต่ำ',
          currentValue: nitrogen.current,
          targetValue: '80-150 ppm',
          solution: 'ปุ๋ยยูเรีย 46-0-0 หรือ Blood Meal (อินทรีย์)',
          amount: '30-50 กก./ไร่',
          method: 'โรยรอบโคนต้น หรือละลายน้ำรด',
          frequency: 'ทุก 7-10 วัน (ระยะเจริญเติบโต)',
          cost: '450-750 บาท',
          benefit: 'เพิ่มการเจริญเติบโตของใบ สร้างคลอโรฟิลล์',
          caution: 'ระวังใส่มากเกินไป อาจทำให้ใบไหม้'
        });
      }

      if (phosphorus?.current < 30) {
        recommendations.push({
          priority: 'medium',
          category: 'Phosphorus',
          issue: 'ฟอสฟอรัสในดินต่ำ',
          currentValue: phosphorus.current,
          targetValue: '30-70 ppm',
          solution: 'ปุ๋ย Super Phosphate หรือ Bone Meal',
          amount: '20-40 กก./ไร่',
          method: 'ผสมดิน หรือละลายน้ำรด',
          frequency: 'ทุก 14 วัน',
          cost: '600-1,200 บาท',
          benefit: 'ส่งเสริมการพัฒนาราก กระตุ้นการออกดอก'
        });
      }

      if (potassium?.current < 120) {
        recommendations.push({
          priority: 'high',
          category: 'Potassium',
          issue: 'โพแทสเซียมในดินต่ำ',
          currentValue: potassium.current,
          targetValue: '120-200 ppm',
          solution: 'ปุ๋ยโพแทส (K2SO4) หรือ Kelp Meal',
          amount: '25-45 กก./ไร่',
          method: 'โรยทั่วแปลง รดน้ำตาม',
          frequency: 'ทุก 7-10 วัน (ระยะออกดอก)',
          cost: '750-1,350 บาท',
          benefit: 'เพิ่มคุณภาพผลผลิต ทนทานต่อโรค',
          note: 'สำคัญมากในช่วงออกดอกและติดผล'
        });
      }
    }

    // Moisture recommendations
    if (soilData.moisture?.current) {
      const moisture = soilData.moisture.current;

      if (moisture < 30) {
        recommendations.push({
          priority: 'critical',
          category: 'Moisture',
          issue: 'ความชื้นในดินต่ำมาก',
          currentValue: `${moisture}%`,
          targetValue: '40-60%',
          solution: 'ให้น้ำทันที',
          amount: 'รดน้ำจนดินชุ่ม',
          method: 'ระบบ Drip irrigation (ประหยัดน้ำ 40%)',
          frequency: 'วันละ 1-2 ครั้ง (เช้า-เย็น)',
          urgency: 'ภายใน 6 ชั่วโมง',
          benefit: 'ป้องกันพืชเหี่ยว เพิ่มการดูดซึมธาตุอาหาร'
        });
      }
    }

    // Organic matter recommendations
    if (!soilData.organicMatter || soilData.organicMatter < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'Organic Matter',
        issue: 'ดินขาดอินทรียวัตถุ',
        currentValue: `${soilData.organicMatter || 0}%`,
        targetValue: '5-7%',
        solution: 'คอมโพสต์ หรือ มูลไส้เดือน',
        amount: '500-1,000 กก./ไร่',
        method: 'ผสมคลุกเคล้าดิน',
        frequency: 'ทุก 3-6 เดือน',
        cost: '2,500-5,000 บาท',
        benefit: 'เพิ่มความอุดมสมบูรณ์ ปรับโครงสร้างดิน เก็บน้ำได้ดีขึ้น'
      });
    }

    res.json(
      ApiResponse.success({
        currentConditions: soilData,
        recommendations: recommendations.sort((a, b) => {
          const priority = { critical: 0, high: 1, medium: 2, low: 3 };
          return priority[a.priority] - priority[b.priority];
        }),
        summary: {
          total: recommendations.length,
          critical: recommendations.filter(r => r.priority === 'critical').length,
          high: recommendations.filter(r => r.priority === 'high').length,
          estimatedCost: recommendations.reduce((sum, r) => {
            const cost = parseInt(r.cost?.replace(/[^0-9]/g, '') || 0);
            return sum + cost;
          }, 0)
        }
      })
    );
  } catch (error) {
    logger.error('Failed to get soil recommendations', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('Failed to get recommendations', 500, error.message));
  }
};
```

---

## Water Monitoring Integration

### Supported Water Sensors

**1. Water pH Sensor**

- **Range**: 0-14 pH
- **Accuracy**: ±0.1 pH
- **Recommended**: Atlas Scientific pH Probe

**2. Water EC Sensor (Electrical Conductivity)**

- **Range**: 0-20 mS/cm
- **Accuracy**: ±2%
- **Recommended**: Atlas Scientific EC Probe

**3. Water TDS Sensor (Total Dissolved Solids)**

- **Range**: 0-5000 ppm
- **Accuracy**: ±2%
- **Recommended**: TDS Meter Probe

**4. Water Temperature**

- **Range**: 0-50°C
- **Accuracy**: ±0.5°C
- **Recommended**: DS18B20 Waterproof

**5. Dissolved Oxygen (DO) Sensor**

- **Range**: 0-20 mg/L
- **Accuracy**: ±0.5 mg/L
- **Recommended**: Atlas Scientific DO Probe

### Water Monitoring Schema

**Add to Farm Model**:

```javascript
waterMonitoring: {
  enabled: { type: Boolean, default: false },

  sensors: [{
    deviceId: { type: String, ref: 'IoTDevice' },
    waterSource: {
      type: String,
      enum: ['well', 'river', 'rainwater', 'municipal', 'pond', 'irrigation_canal']
    },
    location: String,
    installDate: Date,
    active: { type: Boolean, default: true }
  }],

  realTimeData: {
    ph: {
      current: Number,
      optimal: { min: { type: Number, default: 6.0 }, max: { type: Number, default: 7.0 } },
      lastUpdated: Date,
      status: { type: String, enum: ['good', 'acidic', 'alkaline'] }
    },

    ec: {
      current: Number,
      optimal: { min: { type: Number, default: 0.8 }, max: { type: Number, default: 2.0 } },
      unit: { type: String, default: 'mS/cm' },
      lastUpdated: Date,
      status: { type: String, enum: ['good', 'low', 'high'] }
    },

    tds: {
      current: Number,
      optimal: { min: { type: Number, default: 400 }, max: { type: Number, default: 1000 } },
      unit: { type: String, default: 'ppm' },
      lastUpdated: Date,
      status: { type: String, enum: ['good', 'low', 'high'] }
    },

    temperature: {
      current: Number,
      optimal: { min: { type: Number, default: 18 }, max: { type: Number, default: 28 } },
      unit: { type: String, default: 'C' },
      lastUpdated: Date
    },

    dissolvedOxygen: {
      current: Number,
      optimal: { min: { type: Number, default: 5 }, max: { type: Number, default: 10 } },
      unit: { type: String, default: 'mg/L' },
      lastUpdated: Date,
      status: { type: String, enum: ['good', 'low'] }
    }
  },

  irrigationSchedule: [{
    scheduleName: String,
    zoneName: String,
    startTime: Date,
    endTime: Date,
    duration: Number, // minutes
    waterAmount: Number, // liters
    frequency: {
      type: String,
      enum: ['daily', 'every_2_days', 'weekly', 'custom']
    },
    customDays: [Number], // [0-6] for Sunday-Saturday
    autoTriggered: { type: Boolean, default: false },
    sensorTriggerId: String,
    active: { type: Boolean, default: true },
    history: [{
      executedAt: Date,
      duration: Number,
      waterUsed: Number,
      efficiency: Number,
      notes: String
    }]
  }],

  waterUsage: {
    daily: { type: Number, default: 0 }, // liters
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    lastReset: Date,
    cost: {
      perLiter: { type: Number, default: 0.05 }, // THB
      monthly: Number
    }
  },

  qualityTests: [{
    testDate: Date,
    labName: String,
    labCertification: String,

    parameters: {
      ph: Number,
      tds: Number,
      hardness: Number,
      turbidity: Number,

      bacteria: {
        ecoli: Number,
        totalColiform: Number,
        fecalColiform: Number
      },

      heavyMetals: {
        lead: Number,
        mercury: Number,
        cadmium: Number,
        arsenic: Number,
        chromium: Number
      },

      chemicals: {
        nitrate: Number,
        phosphate: Number,
        chloride: Number,
        fluoride: Number
      }
    },

    passed: Boolean,
    safeForIrrigation: Boolean,
    certificate: String,
    uploadedBy: mongoose.Schema.Types.ObjectId,
    verified: { type: Boolean, default: false }
  }]
}
```

### Water Monitoring Routes

**File**: `apps/backend/modules/iot/routes/iot.routes.js`

```javascript
const express = require('express');
const router = express.Router();

// Import controllers
const deviceController = require('../application/controllers/device.controller');
const soilController = require('../application/controllers/soil.controller');
const waterController = require('../application/controllers/water.controller');
const dataController = require('../application/controllers/data.controller');

const { authenticate } = require('../../../shared/middleware/auth');
const { authorize } = require('../../../shared/middleware/authorize');

// Device Management Routes
router.use('/devices', require('./device.routes'));

// Soil Monitoring Routes
router.get('/soil/:farmId/conditions', authenticate, soilController.getSoilConditions);
router.get('/soil/:farmId/history', authenticate, soilController.getSoilHistory);
router.post(
  '/soil/:farmId/lab-test',
  authenticate,
  authorize(['FARMER', 'INSPECTOR', 'ADMIN']),
  soilController.submitLabTest
);
router.post(
  '/soil/:farmId/improvement',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  soilController.recordSoilImprovement
);
router.get('/soil/:farmId/recommendations', authenticate, soilController.getSoilRecommendations);

// Water Monitoring Routes
router.get('/water/:farmId/conditions', authenticate, waterController.getWaterConditions);
router.get('/water/:farmId/history', authenticate, waterController.getWaterHistory);
router.post(
  '/water/:farmId/quality-test',
  authenticate,
  authorize(['FARMER', 'INSPECTOR', 'ADMIN']),
  waterController.submitQualityTest
);
router.get(
  '/water/:farmId/irrigation-schedule',
  authenticate,
  waterController.getIrrigationSchedule
);
router.post(
  '/water/:farmId/irrigation-schedule',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  waterController.createIrrigationSchedule
);
router.put(
  '/water/:farmId/irrigation-schedule/:scheduleId',
  authenticate,
  authorize(['FARMER', 'ADMIN']),
  waterController.updateIrrigationSchedule
);

// Sensor Data Routes
router.get('/data/:deviceId/latest', authenticate, dataController.getLatestReading);
router.get('/data/:deviceId/range', authenticate, dataController.getReadingRange);
router.get('/data/:deviceId/stats', authenticate, dataController.getStatistics);

module.exports = router;
```

Due to length constraints, I'll continue with the remaining sections in the next edit. Let me mark the first todo as complete and continue:
