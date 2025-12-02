const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const _roleCheck = require('../middleware/role-check');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const logger = require('../shared').logger;
const farmLogger = logger.createLogger('farm-management');

// Get all farms (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { region, status, farmingType, owner, search } = req.query;

    // Build filter
    const filter = {};
    if (region) {
      filter.region = region;
    }
    if (status) {
      filter.status = status;
    }
    if (farmingType) {
      filter.farmingType = farmingType;
    }
    if (owner) {
      filter.owner = owner;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Check user permissions
    if (!req.user.roles.includes('admin')) {
      // Regular users can only see their own farms
      filter.owner = req.user.id;
    }

    const farms = await Farm.find(filter).populate('owner', 'name email').sort({ name: 1 });

    res.json(farms);
  } catch (err) {
    farmLogger.error('Error fetching farms:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new farm
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      registrationNumber,
      contactDetails,
      location,
      region,
      totalArea,
      farmingType,
      waterSources,
    } = req.body;

    // Check for duplicate registration
    if (registrationNumber) {
      const existingFarm = await Farm.findOne({ registrationNumber });
      if (existingFarm) {
        return res.status(400).json({
          message: 'Farm with this registration number already exists',
        });
      }
    }

    const newFarm = new Farm({
      name,
      registrationNumber,
      owner: req.user.id,
      contactDetails,
      location,
      region,
      totalArea,
      farmingType,
      waterSources,
      plots: [],
      certifications: [],
    });

    const farm = await newFarm.save();

    // Notify admins about new farm registration
    const io = req.app.get('io');
    if (io) {
      io.to('admin-channel').emit('new-farm-registered', {
        farmId: farm._id,
        name: farm.name,
        owner: req.user.id,
        timestamp: new Date(),
      });
    }

    res.status(201).json(farm);
  } catch (err) {
    farmLogger.error('Error creating farm:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get farm by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('managers', 'name email');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m._id.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(farm);
  } catch (err) {
    farmLogger.error(`Error fetching farm ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farm
router.put('/:id', auth, async (req, res) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (!req.user.roles.includes('admin') && farm.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    const updateData = { ...req.body };
    delete updateData.owner; // Don't allow changing ownership

    farm = await Farm.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

    res.json(farm);
  } catch (err) {
    farmLogger.error(`Error updating farm ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add plot to farm
router.post('/:id/plots', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (!req.user.roles.includes('admin') && farm.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, size, location, soilType, status } = req.body;

    farm.plots.push({
      name,
      size,
      location,
      soilType,
      status,
    });

    await farm.save();

    res.status(201).json(farm.plots[farm.plots.length - 1]);
  } catch (err) {
    farmLogger.error(`Error adding plot to farm ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all crops for a farm
router.get('/:id/crops', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const crops = await Crop.find({ farm: req.params.id });
    res.json(crops);
  } catch (err) {
    farmLogger.error(`Error fetching crops for farm ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add crop to farm
router.post('/:id/crops', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, scientificName, variety, category } = req.body;

    const newCrop = new Crop({
      name,
      scientificName,
      variety,
      category,
      farm: req.params.id,
    });

    const crop = await newCrop.save();
    res.status(201).json(crop);
  } catch (err) {
    farmLogger.error(`Error adding crop to farm ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farm analytics endpoint
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    if (
      !req.user.roles.includes('admin') &&
      farm.owner.toString() !== req.user.id &&
      !farm.managers.some(m => m.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const crops = await Crop.find({ farm: req.params.id });

    // Calculate total active area
    const activeArea = farm.plots
      .filter(plot => plot.status === 'active')
      .reduce((sum, plot) => sum + plot.size.value, 0);

    // Count crops by category
    const cropsByCategory = crops.reduce((acc, crop) => {
      acc[crop.category] = (acc[crop.category] || 0) + 1;
      return acc;
    }, {});

    // Calculate upcoming harvests
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const upcomingHarvests = [];

    crops.forEach(crop => {
      crop.growingCycles.forEach(cycle => {
        if (
          cycle.status === 'growing' &&
          cycle.expectedHarvestDate &&
          cycle.expectedHarvestDate > now &&
          cycle.expectedHarvestDate < nextMonth
        ) {
          upcomingHarvests.push({
            cropId: crop._id,
            cropName: crop.name,
            plotId: cycle.plot,
            harvestDate: cycle.expectedHarvestDate,
            expectedYield: cycle.yield.expected,
          });
        }
      });
    });

    res.json({
      farmId: farm._id,
      farmName: farm.name,
      totalArea: farm.totalArea,
      activeArea,
      plotCount: farm.plots.length,
      cropCount: crops.length,
      cropsByCategory,
      upcomingHarvests,
      certifications: farm.certifications
        .filter(cert => cert.status === 'active')
        .map(cert => cert.type),
    });
  } catch (err) {
    farmLogger.error(`Error generating analytics for farm ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
