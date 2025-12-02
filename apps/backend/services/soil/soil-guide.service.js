const SOIL_TYPES = {
  clay: {
    name: 'ดินเหนียว',
    suitableCrops: ['ข้าว', 'กัญชา'],
    improvements: ['เพิ่มอินทรีย์วัตถุ 500 kg/ไร่', 'ไถพรวนให้ร่วนซุย'],
    fertilizer: { N: 'ปานกลาง', P: 'สูง', K: 'ปานกลาง' },
  },
  loam: {
    name: 'ดินร่วน',
    suitableCrops: ['กัญชา', 'ขมิ้น', 'ขิง'],
    improvements: ['รักษาอินทรีย์วัตถุ'],
    fertilizer: { N: 'ปานกลาง', P: 'ปานกลาง', K: 'ปานกลาง' },
  },
  sand: {
    name: 'ดินทราย',
    suitableCrops: ['มันสำปะหลัง', 'ถั่ว'],
    improvements: ['เพิ่มอินทรีย์วัตถุ 1,000 kg/ไร่', 'รดน้ำบ่อย'],
    fertilizer: { N: 'สูง', P: 'สูง', K: 'สูง' },
  },
};

class SoilGuideService {
  getSoilRecommendation(soilType, pH, crop) {
    const soil = SOIL_TYPES[soilType] || SOIL_TYPES.loam;

    return {
      soilInfo: soil,
      pHAdvice: this.getPHAdvice(pH),
      cropSuitability: soil.suitableCrops.includes(crop) ? 'เหมาะสม' : 'ปานกลาง',
      improvements: soil.improvements,
      fertilizer: soil.fertilizer,
    };
  }

  getPHAdvice(pH) {
    if (pH < 6.0) {
      return 'ดินเป็นกรด - ใส่ปูนขาว';
    }
    if (pH > 7.5) {
      return 'ดินเป็นด่าง - ใส่ปุ๋ยอินทรีย์';
    }
    return 'ค่า pH เหมาะสม';
  }
}

module.exports = SoilGuideService;
