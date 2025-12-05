class ApplicationScorer {
    /**
     * Assess farm information accuracy
     * @param {Object} farmInfo - Farm information object
     * @returns {number} Score (0-100)
     */
    assessFarmInformation(farmInfo) {
        let score = 0;

        // Location completeness (25%)
        if (farmInfo.location && farmInfo.location.coordinates) {
            score += 25;
        }

        // Land ownership documentation (25%)
        if (farmInfo.landOwnership && farmInfo.landOwnership.documents.length > 0) {
            score += 25;
        }

        // Water source quality (25%)
        if (farmInfo.waterSource && farmInfo.waterSource.quality === 'good') {
            score += 25;
        }

        // Soil information (25%)
        if (farmInfo.soilType && farmInfo.soilType.ph) {
            score += 25;
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
        const documentWeight = 0.3;
        const farmInfoWeight = 0.3;
        const practiceWeight = 0.4;

        const baseScore =
            documentValidation.score * documentWeight +
            farmInfoScore * farmInfoWeight +
            practiceScore * practiceWeight;

        // Risk level adjustment
        const riskAdjustments = {
            low: 0,
            medium: -5,
            high: -10,
            critical: -20,
        };

        return Math.max(0, baseScore + (riskAdjustments[riskLevel] || 0));
    }

    /**
     * Convert inspection results to standardized compliance scores
     * @param {Object} inspectionResults - Results from inspection
     * @returns {Array} Array of score objects
     */
    calculateComplianceScores(inspectionResults) {
        const categories = [
            'seed_planting_material',
            'soil_management',
            'pest_disease_management',
            'harvesting_practices',
            'post_harvest_handling',
            'storage_transportation',
            'record_keeping',
            'worker_training',
        ];

        return categories.map(category => ({
            category,
            maxScore: 15, // Each category worth 15 points (total 120, normalized to 100)
            achievedScore: inspectionResults.scores[category] || 0,
            notes: inspectionResults.notes[category] || '',
            recommendations: inspectionResults.recommendations[category] || [],
        }));
    }
}

module.exports = new ApplicationScorer();
