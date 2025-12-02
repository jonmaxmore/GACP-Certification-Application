class IrrigationService {
  calculateWaterNeeds(crop, growthStage, weather, soilType) {
    const cropCoef = this.getCropCoefficient(crop, growthStage);
    const ET0 = 5; // Simplified
    const waterNeed = cropCoef * ET0;
    const soilFactor = soilType === 'sand' ? 1.3 : soilType === 'clay' ? 0.8 : 1.0;
    const rainfall = weather.rainfall || 0;
    const finalWater = Math.max(0, waterNeed * soilFactor - rainfall);

    return {
      waterPerDay: finalWater,
      frequency: soilType === 'sand' ? 'ทุกวัน' : 'วันเว้นวัน',
      tips: this.getWaterTips(crop, growthStage),
    };
  }

  getCropCoefficient(crop, stage) {
    const coefficients = {
      cannabis: { seedling: 0.3, vegetative: 0.7, flowering: 1.0, harvest: 0.5 },
    };
    return coefficients[crop]?.[stage] || 0.7;
  }

  getWaterTips(crop, stage) {
    if (stage === 'flowering') {
      return 'ระยะออกดอก - ให้น้ำสม่ำเสมอ';
    }
    if (stage === 'seedling') {
      return 'ต้นกล้า - รดน้ำเบาๆ';
    }
    return 'รดน้ำตามปกติ';
  }
}

module.exports = IrrigationService;
