const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function test() {
    console.log('Starting MongoMemoryServer...');
    try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log('Mongo URI:', uri);

        console.log('Connecting mongoose...');
        await mongoose.connect(uri);
        console.log('Connected!');

        await mongoose.disconnect();
        await mongod.stop();
        console.log('Done.');
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
