# 📜 UAT Scripts - README

Scripts สำหรับการทดสอบ UAT (User Acceptance Testing)

---

## 📁 Files

### 1. `seed-uat-data.js`

**Purpose:** สร้างข้อมูลทดสอบในฐานข้อมูล

**What it creates:**

- ✅ 13 Test Users (5 roles: Farmer, Reviewer, Inspector, Approver, Admin)
- ✅ 10 Test Farms (across 4 regions)
- ✅ 13 Test Applications (various states)

**Usage:**

```bash
npm run uat:seed
# or
node scripts/seed-uat-data.js
```

**Requirements:**

- MongoDB running on localhost:27017
- .env.uat file configured

---

### 2. `run-uat-tests.js`

**Purpose:** รันการทดสอบอัตโนมัติสำหรับทุก Role และ Module

**What it tests:**

- ✅ Farmer role (6 test cases)
- ✅ Reviewer role (5 test cases)
- ✅ Inspector role (5 test cases)
- ✅ Approver role (6 test cases)
- ✅ Admin role (10 test cases)

**Usage:**

```bash
npm run uat:test
# or
node scripts/run-uat-tests.js
```

**Requirements:**

- Backend server running on localhost:3001
- Test data seeded in database

**Output:**

```
🧪 UAT TEST RUNNER
================================================
✅ TC-F001: Farmer Login - PASSED
✅ TC-F002: View Farm Profile - PASSED
...
📊 TEST SUMMARY
Total: 32 | Passed: 30 | Failed: 2 | Pass Rate: 93.75%
```

---

## 🚀 Quick Start

### Step 1: Setup Environment

```bash
npm run uat:setup
```

### Step 2: Seed Test Data

```bash
npm run uat:seed
```

### Step 3: Start Server

```bash
npm run uat:server
```

### Step 4: Run Tests

```bash
# In new terminal
npm run uat:test
```

---

## 🔑 Test Credentials

All users created by `seed-uat-data.js`:

### Farmers (5)

```
farmer001 / Test@1234 - Somchai Prasert (Central)
farmer002 / Test@1234 - Somsri Boonmee (Northern)
farmer003 / Test@1234 - Wichai Saengthong (Southern)
farmer004 / Test@1234 - Nittaya Chaiyaporn (Northeastern)
farmer005 / Test@1234 - Surachai Thongchai (Central)
```

### DTAM Staff (8)

```
Reviewers:
  reviewer001 / Rev@1234 - Panya Reviewer
  reviewer002 / Rev@1234 - Sarawut Review

Inspectors:
  inspector001 / Insp@1234 - Krit Inspector
  inspector002 / Insp@1234 - Chatchai Inspect
  inspector003 / Insp@1234 - Preecha Field

Approvers:
  approver001 / App@1234 - Wichai Approver
  approver002 / App@1234 - Somkid Approve

Admin:
  admin001 / Admin@1234 - Narong Admin
```

---

## 🗄️ Database Schema

### Collections Created

1. **users** - User accounts

   ```javascript
   {
     username: String,
     password: String (hashed with bcrypt),
     email: String,
     name: String,
     role: String,
     nationalId: String,
     phone: String,
     staffId: String,
     region: String,
     status: String
   }
   ```

2. **farms** - Farm profiles

   ```javascript
   {
     farmId: String,
     name: String,
     ownerId: ObjectId,
     location: {
       province: String,
       district: String,
       subDistrict: String,
       latitude: Number,
       longitude: Number
     },
     region: String,
     size: Number,
     cropType: [String],
     status: String
   }
   ```

3. **applications** - Certification applications
   ```javascript
   {
     applicationId: String,
     farmId: ObjectId,
     applicantId: ObjectId,
     status: String,
     reviewerId: ObjectId,
     inspectorId: ObjectId,
     approverId: ObjectId,
     submittedAt: Date,
     reviewedAt: Date,
     inspectedAt: Date,
     approvedAt: Date
   }
   ```

---

## 🔧 Configuration

### Environment Variables (.env.uat)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/botanical-audit-uat

# Server
NODE_ENV=uat
PORT=3001

# JWT
JWT_SECRET=uat_jwt_secret_key
DTAM_JWT_SECRET=uat_dtam_jwt_secret_key

# Testing
UAT_MODE=true
SEED_TEST_DATA=true
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Start MongoDB
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
```

### Seed Script Fails

```bash
# Install dependencies
cd apps/backend
pnpm install

# Check MongoDB connection
mongosh "mongodb://localhost:27017/botanical-audit-uat"

# Clear database and retry
mongosh
> use botanical-audit-uat
> db.dropDatabase()
> exit
npm run uat:seed
```

### Test Script Fails

```bash
# Make sure server is running
npm run uat:server

# Check if server is responding
curl http://localhost:3001/api/health

# Run tests with debug
DEBUG=* node scripts/run-uat-tests.js
```

---

## 📊 Test Coverage

### By Role

- **Farmer:** 6 test cases
- **Reviewer:** 5 test cases
- **Inspector:** 5 test cases
- **Approver:** 6 test cases
- **Admin:** 10 test cases

**Total:** 32 automated test cases

### By Module

- **Member Management:** Authentication, Profile, User CRUD
- **Certification:** Application, Review, Inspection, Approval
- **Farm Management:** Farm CRUD, Location mapping
- **Track & Trace:** Activity recording
- **Survey:** Survey response
- **GACP Compare:** Standards comparison

---

## 🔄 Re-seeding Data

To clear and re-seed:

```bash
# Option 1: Using MongoDB Shell
mongosh
> use botanical-audit-uat
> db.users.deleteMany({})
> db.farms.deleteMany({})
> db.applications.deleteMany({})
> exit

npm run uat:seed

# Option 2: Using script
node scripts/seed-uat-data.js
```

---

## 📝 Adding More Test Data

Edit `seed-uat-data.js`:

```javascript
// Add more farmers
const testUsers = {
  farmers: [
    ...existingFarmers,
    {
      username: 'farmer006',
      password: 'Test@1234',
      email: 'newfarmer@test.com',
      name: 'New Farmer',
      role: 'farmer'
      // ...
    }
  ]
};
```

---

## 🎯 Success Criteria

### Seed Script Success

```
✅ MongoDB connected successfully
✅ Successfully seeded 13 users
✅ Successfully seeded 10 farms
✅ Successfully seeded 13 applications
```

### Test Script Success

```
✅ Pass Rate: ≥ 95%
✅ All critical test cases passed
✅ No authentication failures
✅ API response time < 3s
```

---

## 📞 Support

For issues with scripts:

- 📧 Email: uat-support@botanical.test
- 🐛 GitHub Issues: [Create Issue]
- 📖 Documentation: `docs/UAT_*.md`

---

**Last Updated:** October 20, 2025  
**Version:** 1.0  
**Maintained by:** Development Team
