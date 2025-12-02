const express = require('express');
const router = express.Router();

const WeatherService = require('../services/weather/weather.service');
const SoilGuideService = require('../services/soil/soil-guide.service');
const IrrigationService = require('../services/irrigation/irrigation.service');
const CropCalendarService = require('../services/calendar/crop-calendar.service');
const provinces = require('../data/provinces.json');

// GET /api/smart-agriculture/weather/:lat/:lon
router.get('/weather/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const weather = await WeatherService.getCurrentWeather(lat, lon);
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/smart-agriculture/weather/:lat/:lon/forecast
router.get('/weather/:lat/:lon/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const forecast = await WeatherService.get7DayForecast(lat, lon);
    res.json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/smart-agriculture/soil/recommend
router.post('/soil/recommend', (req, res) => {
  try {
    const { soilType, pH, crop } = req.body;
    const recommendation = SoilGuideService.getRecommendation(soilType, pH, crop);
    res.json({ success: true, data: recommendation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/smart-agriculture/provinces
router.get('/provinces', (req, res) => {
  res.json({ success: true, data: provinces });
});

// GET /api/smart-agriculture/provinces/:name
router.get('/provinces/:name', (req, res) => {
  const province = provinces.find(p => p.name === req.params.name);
  if (!province) {
    return res.status(404).json({ success: false, error: 'Province not found' });
  }
  res.json({ success: true, data: province });
});

// POST /api/smart-agriculture/irrigation/calculate
router.post('/irrigation/calculate', (req, res) => {
  try {
    const { crop, growthStage, temperature, humidity, rainfall, soilType } = req.body;
    const result = IrrigationService.calculateWaterNeeds(
      crop,
      growthStage,
      temperature,
      humidity,
      rainfall,
      soilType,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/smart-agriculture/calendar/:crop/:province
router.get('/calendar/:crop/:province', (req, res) => {
  try {
    const { crop, province } = req.params;
    const calendar = CropCalendarService.getPlantingCalendar(crop, province);
    res.json({ success: true, data: calendar });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
