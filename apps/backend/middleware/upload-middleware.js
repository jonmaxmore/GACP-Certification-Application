const { createUploader } = require('../services/storage-service');

// Generic uploader: Root 'uploads' folder, images/pdf, 5MB limit
const upload = createUploader('', ['image/jpeg', 'image/png', 'application/pdf'], 5);

module.exports = upload;

