const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

describe('DB Connection Isolation', () => {
    let mongod;
    let uri;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        process.env.MONGODB_URI = uri;
        process.env.NODE_ENV = 'test';
    });

    afterAll(async () => {
        if (mongod) await mongod.stop();
        await mongoose.disconnect();
    });

    it('should connect using ProductionDatabase service', async () => {
        console.log('URI:', uri);
        const databaseService = require('../../services/ProductionDatabase');
        await databaseService.connect();
        expect(databaseService.isConnected).toBe(true);
        expect(mongoose.connection.readyState).toBe(1);
    });
});
