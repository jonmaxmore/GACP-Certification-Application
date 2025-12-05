
try {
    console.log('Loading UserModel...');
    const UserModel = require('./apps/backend/models/UserModel');
    console.log('UserModel loaded.');

    console.log('Loading AuthService...');
    const AuthService = require('./apps/backend/services/AuthService');
    console.log('AuthService loaded.');
} catch (error) {
    console.error('Error:', error);
}
