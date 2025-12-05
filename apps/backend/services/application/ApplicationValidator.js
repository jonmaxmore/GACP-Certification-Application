const { ValidationError } = require('../../shared/errors');

class ApplicationValidator {
    /**
     * Validate initial application data
     * @param {Object} data - Application data
     */
    validateApplicationData(data) {
        if (!data.farmInformation) {
            throw new ValidationError('Farm information is required');
        }

        if (!data.cropInformation || data.cropInformation.length === 0) {
            throw new ValidationError('At least one crop must be specified');
        }

        // Additional validation rules can be added here
    }

    /**
     * Validate application completeness for submission
     * @param {Object} application - Application object
     */
    validateApplicationCompleteness(application) {
        const requiredDocuments = [
            'application_form',
            'farm_management_plan',
            'cultivation_records',
            'land_rights_certificate',
        ];

        const submittedDocuments = application.documents.map(doc => doc.documentType);
        const missingDocuments = requiredDocuments.filter(doc => !submittedDocuments.includes(doc));

        if (missingDocuments.length > 0) {
            // In a real scenario, we might want to check the specific form type requirements
            // For now, we'll log warning instead of blocking if it's strict
            // or throw error if business logic demands it.
            // Based on original code, it throws ValidationError
            // throw new ValidationError(`Missing required documents: ${missingDocuments.join(', ')}`);

            // NOTE: Original code threw error. Keeping it consistent.
            throw new ValidationError(`Missing required documents: ${missingDocuments.join(', ')}`);
        }
    }

    /**
     * Validate documents and calculate verification score
     * @param {Object} application - Application object
     * @returns {Object} Validation result with score and issues
     */
    validateDocuments(application) {
        let score = 0;
        const totalDocuments = application.documents.length;
        const verifiedDocuments = application.documents.filter(
            doc => doc.verificationStatus === 'verified',
        ).length;

        score = totalDocuments > 0 ? (verifiedDocuments / totalDocuments) * 100 : 0;

        return {
            score,
            totalDocuments,
            verifiedDocuments,
            issues: application.documents.filter(doc => doc.verificationStatus === 'rejected'),
        };
    }

    /**
     * Validate inspection results structure
     * @param {Object} results - Inspection results
     */
    validateInspectionResults(results) {
        if (!results.complianceChecklist) {
            throw new ValidationError('Compliance checklist is required');
        }

        if (!results.scores || typeof results.scores !== 'object') {
            throw new ValidationError('Assessment scores are required');
        }
    }
}

module.exports = new ApplicationValidator();
