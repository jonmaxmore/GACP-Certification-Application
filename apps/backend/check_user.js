const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin';

async function checkUser() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const User = mongoose.connection.collection('users');
        const user = await User.findOne({ email: 'farmer@gacp.com' });

        if (user) {
            console.log('FOUND_USER:', user.email);
            console.log('ID_CARD:', user.idCard);
        } else {
            console.log('USER_NOT_FOUND');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
