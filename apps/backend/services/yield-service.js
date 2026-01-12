const logger = require('../shared/logger');

class YieldService {
    constructor() {
        this.RISK_FACTORS = {
            'INDOOR': 0.95,    // 5% loss
            'GREENHOUSE': 0.90, // 10% loss
            'OUTDOOR': 0.70    // 30% loss
        };

        // Mock data until DB seeding is complete
        this.PLANT_YIELD_DATA = {
            'CAN': { yieldPerPlant: 0.5, spacing: 1.5 }, // 0.5 kg dry weight, 1.5m^2 per plant
            'KRA': { yieldPerPlant: 2.0, spacing: 4.0 }, // 2.0 kg dry weight, 4.0m^2 per plant
            'TUR': { yieldPerPlant: 0.8, spacing: 0.5 },
            'GIN': { yieldPerPlant: 0.6, spacing: 0.5 },
            'BGA': { yieldPerPlant: 0.4, spacing: 0.3 },
            'PLA': { yieldPerPlant: 1.2, spacing: 1.0 }
        };
    }

    /**
     * Calculate Estimated Yield
     * @param {string} plantCode - 'CAN', 'KRA', etc.
     * @param {string} cultivationMode - 'INDOOR', 'GREENHOUSE', 'OUTDOOR'
     * @param {number} plotAreaRai - Area in Rai
     * @returns {object} { estimatedYield: number, plantCount: number }
     */
    calculateYield(plantCode, cultivationMode, plotAreaRai) {
        try {
            // 1 Rai = 1600 sq meters
            const SQM_PER_RAI = 1600;
            const totalSqm = plotAreaRai * SQM_PER_RAI;

            const plantData = this.PLANT_YIELD_DATA[plantCode];
            if (!plantData) {
                logger.warn(`[YieldService] Unknown plant code: ${plantCode}`);
                return { estimatedYield: 0, plantCount: 0 };
            }

            const riskFactor = this.RISK_FACTORS[cultivationMode] || 0.7; // Default to outdoor risk

            // Calculate max plants possible
            // Simple grid logic: Total Area / Spacing required per plant
            // Reduce effective area by 20% for walkways/infrastructure
            const effectiveArea = totalSqm * 0.8;
            const plantCount = Math.floor(effectiveArea / plantData.spacing);

            // Calculate Yield
            const theoreticalYield = plantCount * plantData.yieldPerPlant;
            const estimatedYield = theoreticalYield * riskFactor;

            return {
                estimatedYield: Math.round(estimatedYield * 100) / 100, // Round to 2 decimals
                plantCount,
                unit: 'kg (Dry Weight)'
            };

        } catch (error) {
            logger.error('[YieldService] Calculation error:', error);
            return { estimatedYield: 0, plantCount: 0 };
        }
    }
}

module.exports = new YieldService();
