/**
 * ScoringService.js
 * Domain service for calculating GACP compliance scores
 */

class ScoringService {
    /**
     * Calculate score for Self-Assessment
     * @param {Object} selfAssessment - The self-assessment object from Application model
     * @returns {Object} Score result { totalScore, categoryScores, result }
     */
    calculateSelfAssessmentScore(selfAssessment) {
        if (!selfAssessment || !selfAssessment.items || selfAssessment.items.length === 0) {
            return { totalScore: 0, categoryScores: {}, result: 'fail' };
        }

        const categories = {};
        let totalItems = 0;
        let compliantItems = 0;

        // Group by category
        selfAssessment.items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = { total: 0, compliant: 0 };
            }

            categories[item.category].total++;
            totalItems++;

            if (item.compliant) {
                categories[item.category].compliant++;
                compliantItems++;
            }
        });

        // Calculate category scores
        const categoryScores = {};
        Object.keys(categories).forEach(cat => {
            const { total, compliant } = categories[cat];
            categoryScores[cat] = Math.round((compliant / total) * 100);
        });

        // Calculate total score
        const totalScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

        return {
            totalScore,
            categoryScores,
            result: this.evaluateResult(totalScore)
        };
    }

    /**
     * Calculate score for Inspection
     * @param {Object} inspection - The inspection object
     * @returns {Object} Score result
     */
    calculateInspectionScore(inspection) {
        if (!inspection || !inspection.checklist || inspection.checklist.length === 0) {
            return { totalScore: 0, categoryScores: {}, result: 'fail' };
        }

        const categories = {};
        let totalItems = 0;
        let compliantItems = 0;
        let criticalFailures = 0;

        // Iterate through checklist categories
        inspection.checklist.forEach(categoryGroup => {
            const categoryName = categoryGroup.category;

            if (!categories[categoryName]) {
                categories[categoryName] = { total: 0, compliant: 0 };
            }

            categoryGroup.items.forEach(item => {
                categories[categoryName].total++;
                totalItems++;

                if (item.compliant) {
                    categories[categoryName].compliant++;
                    compliantItems++;
                } else if (item.isCritical) { // Assuming we might add isCritical later
                    criticalFailures++;
                }
            });
        });

        // Calculate category scores
        const categoryScores = {};
        Object.keys(categories).forEach(cat => {
            const { total, compliant } = categories[cat];
            categoryScores[cat] = Math.round((compliant / total) * 100);
        });

        // Calculate total score
        const totalScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

        // Determine result
        let result = this.evaluateResult(totalScore);

        // Automatic fail if critical items are missed (future proofing)
        if (criticalFailures > 0) {
            result = 'fail';
        }

        return {
            totalScore,
            categoryScores,
            result,
            criticalFailures
        };
    }

    /**
     * Evaluate pass/fail result based on score
     * @param {Number} score 
     * @returns {String} 'pass', 'conditional_pass', 'fail'
     */
    evaluateResult(score) {
        if (score >= 80) return 'pass';
        if (score >= 60) return 'conditional_pass';
        return 'fail';
    }
}

module.exports = new ScoringService();
