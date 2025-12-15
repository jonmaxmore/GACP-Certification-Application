/**
 * Application Repository Stub
 * Provides database operations for applications
 * TODO: Implement full repository pattern
 */

const ApplicationModel = require('../../database/models/application-model');

class ApplicationRepository {
    constructor() {
        this.model = ApplicationModel;
    }

    async create(data) {
        const app = new this.model(data);
        return await app.save();
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async findByApplicationNumber(appNumber) {
        return await this.model.findOne({ applicationNumber: appNumber });
    }

    async save(application) {
        return await application.save();
    }

    async findAll(filter = {}) {
        return await this.model.find(filter);
    }

    async findByUserId(userId) {
        return await this.model.find({ 'applicant._id': userId });
    }
}

module.exports = ApplicationRepository;
