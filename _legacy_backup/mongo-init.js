// MongoDB Initialization Script for GACP Platform
// Sprint 1: Foundation Setup
// Date: October 15, 2025

// Switch to admin database for authentication
db = db.getSiblingDB('admin');
db.auth('admin', 'secure_password_123');

// Create GACP Production Database
db = db.getSiblingDB('gacp_production');

print('Creating GACP Production Database...');

// Create Collections
print('Creating collections...');

// 1. Users Collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ nationalId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ phoneNumber: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

// 2. Applications Collection
db.createCollection('applications');
db.applications.createIndex({ applicationNumber: 1 }, { unique: true });
db.applications.createIndex({ farmerId: 1 });
db.applications.createIndex({ status: 1 });
db.applications.createIndex({ createdAt: -1 });
db.applications.createIndex({ farmerId: 1, status: 1 });

// 3. Job Tickets Collection
db.createCollection('jobTickets');
db.jobTickets.createIndex({ ticketNumber: 1 }, { unique: true });
db.jobTickets.createIndex({ applicationId: 1 });
db.jobTickets.createIndex({ assignedTo: 1 });
db.jobTickets.createIndex({ status: 1 });
db.jobTickets.createIndex({ createdAt: -1 });

// 4. Payments Collection
db.createCollection('payments');
db.payments.createIndex({ paymentNumber: 1 }, { unique: true });
db.payments.createIndex({ applicationId: 1 });
db.payments.createIndex({ farmerId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });

// 5. Certificates Collection
db.createCollection('certificates');
db.certificates.createIndex({ certificateNumber: 1 }, { unique: true });
db.certificates.createIndex({ applicationId: 1 });
db.certificates.createIndex({ farmerId: 1 });
db.certificates.createIndex({ status: 1 });
db.certificates.createIndex({ expiryDate: 1 });

// 6. Farms Collection
db.createCollection('farms');
db.farms.createIndex({ farmCode: 1 }, { unique: true });
db.farms.createIndex({ farmerId: 1 });
db.farms.createIndex({ status: 1 });

// 7. Crops Collection
db.createCollection('crops');
db.crops.createIndex({ farmId: 1 });
db.crops.createIndex({ cropType: 1 });
db.crops.createIndex({ status: 1 });

// 8. SOP Records Collection
db.createCollection('sopRecords');
db.sopRecords.createIndex({ farmId: 1 });
db.sopRecords.createIndex({ cropId: 1 });
db.sopRecords.createIndex({ step: 1 });
db.sopRecords.createIndex({ createdAt: -1 });

// 9. Chemical Registry Collection
db.createCollection('chemicalRegistry');
db.chemicalRegistry.createIndex({ farmId: 1 });
db.chemicalRegistry.createIndex({ chemicalName: 1 });
db.chemicalRegistry.createIndex({ usageDate: -1 });

// 10. QR Codes Collection
db.createCollection('qrCodes');
db.qrCodes.createIndex({ qrCode: 1 }, { unique: true });
db.qrCodes.createIndex({ farmId: 1 });
db.qrCodes.createIndex({ cropId: 1 });
db.qrCodes.createIndex({ createdAt: -1 });

// 11. Notifications Collection
db.createCollection('notifications');
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });
db.notifications.createIndex({ userId: 1, isRead: 1 });

// 12. Audit Logs Collection
db.createCollection('auditLogs');
db.auditLogs.createIndex({ userId: 1 });
db.auditLogs.createIndex({ action: 1 });
db.auditLogs.createIndex({ resourceType: 1 });
db.auditLogs.createIndex({ createdAt: -1 });

// 13. Sessions Collection (for Redis fallback)
db.createCollection('sessions');
db.sessions.createIndex({ sessionId: 1 }, { unique: true });
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 14. OTP Records Collection
db.createCollection('otpRecords');
db.otpRecords.createIndex({ phoneNumber: 1 });
db.otpRecords.createIndex({ email: 1 });
db.otpRecords.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.otpRecords.createIndex({ createdAt: -1 });

// 15. Survey Responses Collection
db.createCollection('surveyResponses');
db.surveyResponses.createIndex({ surveyId: 1 });
db.surveyResponses.createIndex({ respondentId: 1 });
db.surveyResponses.createIndex({ createdAt: -1 });

// 16. File Uploads Collection
db.createCollection('fileUploads');
db.fileUploads.createIndex({ uploadId: 1 }, { unique: true });
db.fileUploads.createIndex({ userId: 1 });
db.fileUploads.createIndex({ resourceType: 1 });
db.fileUploads.createIndex({ resourceId: 1 });
db.fileUploads.createIndex({ createdAt: -1 });

print('Collections created successfully!');
print('Indexes created successfully!');

// Create Application User (for backend connection)
db = db.getSiblingDB('admin');
db.createUser({
  user: 'gacp_app',
  pwd: 'gacp_app_password_2025',
  roles: [
    { role: 'readWrite', db: 'gacp_production' },
    { role: 'dbAdmin', db: 'gacp_production' },
  ],
});

print('Application user created successfully!');

// Insert sample data for testing (Sprint 1)
db = db.getSiblingDB('gacp_production');

print('Inserting sample test data...');

// Sample Admin User
db.users.insertOne({
  email: 'admin@gacp.go.th',
  password: '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // bcrypt hash
  fullName: 'Admin GACP',
  role: 'admin',
  phoneNumber: '0812345678',
  isActive: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('Sample data inserted successfully!');

// Show statistics
print('\n=== Database Statistics ===');
print('Collections: ' + db.getCollectionNames().length);
print('Users: ' + db.users.countDocuments());
print('Applications: ' + db.applications.countDocuments());
print('Job Tickets: ' + db.jobTickets.countDocuments());
print('Payments: ' + db.payments.countDocuments());
print('Certificates: ' + db.certificates.countDocuments());

print('\n=== MongoDB Initialization Complete! ===');
print('Database: gacp_production');
print('Status: Ready for Sprint 1');
print('Date: ' + new Date().toISOString());
