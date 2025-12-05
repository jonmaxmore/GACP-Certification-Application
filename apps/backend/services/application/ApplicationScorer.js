const SystemConfig = require('../../config/SystemConfig');

class ApplicationScorer {
    /**
     * Assess farm information accuracy
     * @param {Object} farmInfo - Farm information object
     * @returns {number} Score (0-100)
     */
    assessFarmInformation(farmInfo) {
        let score = 0;
        const pts = SystemConfig.SCORING.FARM_INFO_POINTS;

        // Location completeness
        if (farmInfo.location && farmInfo.location.coordinates) {
            score += pts.LOCATION;
        }

        // Land ownership documentation
        if (farmInfo.landOwnership && farmInfo.landOwnership.documents.length > 0) {
            score += pts.OWNERSHIP;
        }

        // Water source quality
        if (farmInfo.waterSource && farmInfo.waterSource.quality === 'good') {
            score += pts.WATER;
        }

        // Soil information
        if (farmInfo.soilType && farmInfo.soilType.ph) {
            score += pts.SOIL;
        }

        return score;
    }

    /**
     * Assess farming practices
     * @param {Object} practicesData - Farming practices data
     * @returns {number} Score (0-100)
     */
    assessFarmingPractices(_practicesData) {
        // Implement farming practices assessment
        // This would be based on submitted cultivation records and management plans
        // Placeholder from original code
        return 75;
    }

    /**
     * Calculate preliminary review score
     * @param {Object} params - Scoring parameters
     * @param {Object} params.documentValidation - Result from document validation
     * @param {number} params.farmInfoScore - Score from assessFarmInformation
     * @param {number} params.practiceScore - Score from assessFarmingPractices
     * @param {string} params.riskLevel - Risk level from assessment
     * @returns {number} Final preliminary score
     */
    calculatePreliminaryScore({ documentValidation, farmInfoScore, practiceScore, riskLevel }) {
        const weights = SystemConfig.SCORING.WEIGHTS;

        const baseScore =
            documentValidation.score * weights.DOCUMENT +
            farmInfoScore * weights.FARM_INFO +
            practiceScore * weights.PRACTICE;

        // Risk level adjustment
        const riskAdjustments = SystemConfig.SCORING.RISK_ADJUSTMENTS;

        // Map riskLevel string to constant key case if needed, assuming lowercase input match
        const adjustment = riskAdjustments[riskLevel.toUpperCase()] || riskAdjustments[riskLevel] || 0;

        return Math.max(0, baseScore + adjustment);
    }

    /**
     * Convert inspection results to standardized compliance scores
     * @param {Object} inspectionResults - Results from inspection
     * @returns {Array} Array of score objects
     */
    calculateComplianceScores(inspectionResults) {
        const categories = SystemConfig.SCORING.COMPLIANCE.CATEGORIES;

        return categories.map(category => ({
            category,
            maxScore: SystemConfig.SCORING.COMPLIANCE.MAX_CATEGORY_SCORE, // Each category worth 15 points (total 120, normalized to 100)
            achievedScore: inspectionResults.scores[category] || 0,
            notes: inspectionResults.notes[category] || '',
            recommendations: inspectionResults.recommendations[category] || [],
        }));
    }
}

module.exports = new ApplicationScorer();
