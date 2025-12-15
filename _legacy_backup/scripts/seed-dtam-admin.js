/**
 * Seed DTAM Admin Script
 *
 * Purpose: Create initial DTAM Admin account
 * - Email: admin@dtam.go.th
 * - Password: Admin@2025
 * - Role: ADMIN with all 17 permissions
 * - Status: ACTIVE
 *
 * Usage:
 *   node scripts/seed-dtam-admin.js
 */

const mongoose = require('mongoose');
const DTAMStaff = require('../modules/auth-dtam/domain/entities/DTAMStaff');
const MongoDBDTAMStaffRepository = require('../modules/auth-dtam/infrastructure/database/MongoDBDTAMStaffRepository');
const BcryptPasswordHasher = require('../modules/auth-farmer/infrastructure/security/BcryptPasswordHasher');

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_certification';

async function seedDTAMAdmin() {
  console.log('\n=================================================');
  console.log('  DTAM ADMIN SEED SCRIPT');
  console.log('=================================================\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Initialize repository and password hasher
    const staffRepository = new MongoDBDTAMStaffRepository(mongoose.connection.db);
    const passwordHasher = new BcryptPasswordHasher(12);

    // Admin data
    const adminEmail = 'admin@dtam.go.th';
    const adminData = {
      email: adminEmail,
      password: 'Admin@2025',
      firstName: 'System',
      lastName: 'Administrator',
      employeeId: 'DTAM-ADMIN-001',
      role: DTAMStaff.ROLES.ADMIN,
      department: 'IT & Administration',
      position: 'System Administrator',
      phoneNumber: '0201234567'
    };

    // Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    const existingAdmin = await staffRepository.findByEmail(adminEmail);

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('Do you want to reset the admin account? (yes/no): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('❌ Seed cancelled by user\n');
        await mongoose.disconnect();
        process.exit(0);
      }

      console.log('\n🔄 Resetting admin account...');
    } else {
      console.log('✅ No existing admin found\n');
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await passwordHasher.hash(adminData.password);
    console.log('✅ Password hashed\n');

    // Get default ADMIN permissions
    const permissions = DTAMStaff.getDefaultPermissions(DTAMStaff.ROLES.ADMIN);
    console.log(`📋 Default ADMIN permissions (${permissions.length}):`);
    permissions.forEach(p => console.log(`   - ${p}`));
    console.log('');

    // Create DTAM Staff entity
    console.log('👤 Creating DTAM Admin entity...');
    const adminStaff = DTAMStaff.create({
      email: adminData.email,
      passwordHash: hashedPassword,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      employeeId: adminData.employeeId,
      role: adminData.role,
      permissions: permissions,
      department: adminData.department,
      position: adminData.position,
      phoneNumber: adminData.phoneNumber
    });

    // Validate entity
    const validation = adminStaff.validate();
    if (!validation.isValid) {
      console.error('❌ Validation failed:');
      validation.errors.forEach(error => console.error(`   - ${error}`));
      throw new Error('Admin staff validation failed');
    }
    console.log('✅ Entity validated\n');

    // Activate the account
    adminStaff.activate();
    console.log('✅ Account activated\n');

    // Save to database
    console.log('💾 Saving to database...');
    await staffRepository.save(adminStaff);
    console.log('✅ Admin saved to database\n');

    // Summary
    console.log('=================================================');
    console.log('  ✅ DTAM ADMIN CREATED SUCCESSFULLY');
    console.log('=================================================\n');
    console.log('Login Credentials:');
    console.log(`  Email:    ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log('');
    console.log('Account Details:');
    console.log(`  Name:       ${adminData.firstName} ${adminData.lastName}`);
    console.log(`  Employee ID: ${adminData.employeeId}`);
    console.log(`  Role:       ${adminData.role}`);
    console.log(`  Department: ${adminData.department}`);
    console.log(`  Position:   ${adminData.position}`);
    console.log(`  Permissions: ${permissions.length} permissions`);
    console.log(`  Status:     ACTIVE`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

    // Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('');

    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  seedDTAMAdmin()
    .then(() => {
      console.log('✅ Seed script completed successfully\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seed script failed:', error.message);
      process.exit(1);
    });
}

module.exports = seedDTAMAdmin;
