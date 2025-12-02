# 🧹 Database Cleanup Guide

## Overview

Database Cleanup Tool ใช้สำหรับทำความสะอาดข้อมูลที่ไม่ได้ใช้งาน เพิ่มประสิทธิภาพ และรักษาสุขภาพของฐานข้อมูล

## Features

### ✅ Automatic Cleanup

- ลบ refresh tokens ที่หมดอายุ
- ลบ draft applications ที่เก่าเกินกำหนด
- ลบ audit logs เก่า (เก็บ 1 ปี)
- ตรวจสอบและลบ orphaned records

### 🔧 Optimization

- Rebuild indexes
- Compact database
- Analyze collection statistics

### 📊 Reporting

- Detailed cleanup reports
- Before/after statistics
- Error tracking

## Safety Features

### 🛡️ Built-in Protection

- **Dry Run Mode**: Preview changes before executing
- **Batch Operations**: Process data in safe batches
- **Retention Policies**: Keep data for defined periods
- **Error Handling**: Graceful handling with detailed logs

### ⚙️ Configuration

```javascript
const CONFIG = {
  // Retention periods (days)
  EXPIRED_TOKEN_RETENTION: 7, // Keep expired tokens for 7 days
  INACTIVE_USER_RETENTION: 365, // Keep inactive users for 1 year
  DRAFT_APPLICATION_RETENTION: 90, // Keep draft applications for 90 days
  AUDIT_LOG_RETENTION: 365, // Keep audit logs for 1 year

  // Safety
  BACKUP_BEFORE_CLEANUP: true,
  MAX_BATCH_SIZE: 1000
};
```

## Usage

### Method 1: Interactive Menu (Recommended)

**Windows (BAT):**

```batch
cd scripts
cleanup-db.bat
```

**PowerShell:**

```powershell
cd scripts
.\cleanup-db.ps1
```

### Method 2: Command Line

**Dry Run (Safe - Preview Only):**

```bash
node scripts/database-cleanup.js --dry-run
```

**Execute Basic Cleanup:**

```bash
node scripts/database-cleanup.js --execute
```

**Execute Deep Cleanup:**

```bash
node scripts/database-cleanup.js --execute --deep
```

**Show Help:**

```bash
node scripts/database-cleanup.js --help
```

### Method 3: PowerShell with Parameters

```powershell
# Dry run
.\scripts\cleanup-db.ps1 -Mode dry-run

# Execute
.\scripts\cleanup-db.ps1 -Mode execute

# Deep clean
.\scripts\cleanup-db.ps1 -Mode deep

# Help
.\scripts\cleanup-db.ps1 -Help
```

## Cleanup Operations

### 1️⃣ Clean Expired Tokens

**What it does:**

- Finds refresh tokens expired more than 7 days ago
- Deletes them from the database

**SQL Equivalent:**

```javascript
DELETE FROM refreshtokens
WHERE expiresAt < (NOW() - INTERVAL '7 days')
```

**Impact:**

- Low risk
- Frees up storage
- No user impact (tokens already expired)

### 2️⃣ Clean Old Drafts

**What it does:**

- Finds draft applications older than 90 days
- Deletes them from the database

**SQL Equivalent:**

```javascript
DELETE FROM applications
WHERE status = 'DRAFT'
AND createdAt < (NOW() - INTERVAL '90 days')
```

**Impact:**

- Low risk
- Users can recreate drafts if needed
- Frees up significant storage

### 3️⃣ Clean Old Audit Logs

**What it does:**

- Finds audit logs older than 365 days
- Deletes them from the database

**SQL Equivalent:**

```javascript
DELETE FROM auditlogs
WHERE createdAt < (NOW() - INTERVAL '365 days')
```

**Impact:**

- Low risk
- Keeps 1 year of audit history
- Compliance with data retention policies

### 4️⃣ Clean Orphaned Records

**What it does:**

- Finds applications without users
- Finds certificates without applications
- Deletes orphaned records

**SQL Equivalent:**

```javascript
-- Orphaned applications
DELETE FROM applications
WHERE userId NOT IN (SELECT _id FROM users)

-- Orphaned certificates
DELETE FROM certificates
WHERE applicationId NOT IN (SELECT _id FROM applications)
```

**Impact:**

- Medium risk
- Important for data integrity
- Should not occur in normal operations

### 5️⃣ Optimize Indexes (Deep Clean Only)

**What it does:**

- Rebuilds all indexes
- Improves query performance

**MongoDB Command:**

```javascript
db.collection.reIndex();
```

**Impact:**

- Can take time on large collections
- May briefly impact performance
- Improves long-term performance

### 6️⃣ Compact Database (Deep Clean Only)

**What it does:**

- Compacts collection storage
- Reclaims disk space

**MongoDB Command:**

```javascript
db.runCommand({ compact: 'collectionName', force: true });
```

**Impact:**

- Can take significant time
- Requires exclusive lock (brief)
- Frees up disk space

## Recommended Schedule

### Daily (Automated)

```bash
# Light cleanup - expired tokens only
node scripts/database-cleanup.js --execute
```

### Weekly

```bash
# Full cleanup - drafts + logs
node scripts/database-cleanup.js --execute
```

### Monthly

```bash
# Deep cleanup - includes optimization
node scripts/database-cleanup.js --execute --deep
```

## Automation

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2 AM)
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/database-cleanup.js --execute`
7. Start in: `C:\path\to\gacp-certify-flow-main`

### Cron (Linux/Mac)

```bash
# Add to crontab
crontab -e

# Daily at 2 AM
0 2 * * * cd /path/to/gacp-certify-flow-main && node scripts/database-cleanup.js --execute

# Weekly deep clean on Sunday at 3 AM
0 3 * * 0 cd /path/to/gacp-certify-flow-main && node scripts/database-cleanup.js --execute --deep
```

## Output Example

### Dry Run Output

```
🚀 Database Cleanup Tool

Mode: 🔍 DRY RUN (no changes)
Deep Clean: NO

🔌 Connecting to MongoDB...
📍 URI: mongodb://localhost:27017/gacp-dev
✅ Connected to MongoDB successfully

🔍 Analyzing database...

📊 Database Statistics:
   Database: gacp-dev
   Collections: 8
   Total Size: 45.23 MB
   Total Documents: 12,543
   Total Indexes: 24

📋 Collection Details:
   users:
     Documents: 1,234
     Size: 8.45 MB
     Avg Doc Size: 6.85 KB
     Indexes: 5
   applications:
     Documents: 4,567
     Size: 18.92 MB
     Avg Doc Size: 4.14 KB
     Indexes: 6
   ...

🧹 Starting cleanup operations...

🧹 Cleaning expired refresh tokens...
   Found: 45 expired tokens
   🔍 DRY RUN: Would delete 45 tokens

🧹 Cleaning old draft applications...
   Found: 123 old draft applications
   🔍 DRY RUN: Would delete 123 drafts

🧹 Cleaning old audit logs...
   Found: 2,345 old audit logs
   🔍 DRY RUN: Would delete 2,345 audit logs

🧹 Checking for orphaned records...
   ✓ No orphaned applications found
   ✓ No orphaned certificates found

✅ Cleanup completed!

📋 Cleanup Report:
============================================================
Timestamp: 2025-10-16T10:30:45.123Z
Mode: DRY RUN
Deep Clean: NO

Actions Performed:
   No actions performed (dry run)

============================================================

📄 Report saved: logs/cleanup-report-1729075845123.json
```

### Execution Output

```
🚀 Database Cleanup Tool

Mode: ⚡ EXECUTION (will make changes)
Deep Clean: NO

...

🧹 Cleaning expired refresh tokens...
   Found: 45 expired tokens
   ✅ Deleted: 45 expired tokens

🧹 Cleaning old draft applications...
   Found: 123 old draft applications
   ✅ Deleted: 123 old drafts

🧹 Cleaning old audit logs...
   Found: 2,345 old audit logs
   ✅ Deleted: 2,345 old audit logs

✅ Cleanup completed!

📊 Post-cleanup statistics:

📊 Database Statistics:
   Database: gacp-dev
   Collections: 8
   Total Size: 38.76 MB (-6.47 MB)
   Total Documents: 10,030 (-2,513)
   Total Indexes: 24

📋 Cleanup Report:
============================================================
Timestamp: 2025-10-16T10:35:12.456Z
Mode: EXECUTION
Deep Clean: NO

Actions Performed:
   ✓ cleanExpiredTokens: 45 items
   ✓ cleanOldDrafts: 123 items
   ✓ cleanOldAuditLogs: 2,345 items

============================================================
```

## Report Files

Reports are saved to `logs/cleanup-report-{timestamp}.json`:

```json
{
  "timestamp": "2025-10-16T10:35:12.456Z",
  "summary": {},
  "actions": [
    {
      "action": "cleanExpiredTokens",
      "count": 45,
      "size": "N/A"
    },
    {
      "action": "cleanOldDrafts",
      "count": 123,
      "size": "N/A"
    }
  ],
  "errors": [],
  "statistics": {
    "collections": [...],
    "totalSize": 40637440,
    "totalDocuments": 10030,
    "totalIndexes": 24
  }
}
```

## Troubleshooting

### Error: Cannot connect to MongoDB

**Solution:**

1. Check if MongoDB is running
2. Verify MONGODB_URI in .env
3. Check network connectivity

```bash
# Test connection
mongosh "mongodb://localhost:27017/gacp-dev"
```

### Error: Permission denied

**Solution:**

1. Check MongoDB user permissions
2. Ensure user has delete privileges

```javascript
// MongoDB shell
use admin
db.grantRolesToUser("username", ["readWrite"])
```

### Error: Compact not supported

**Solution:**

- Compact requires MongoDB 4.4+
- Not available on all deployments (e.g., Atlas)
- Skip compact or upgrade MongoDB

### Warning: Orphaned records found

**Solution:**

1. Review orphaned records
2. Investigate why they exist
3. Execute cleanup to remove them

```bash
# Review first
node scripts/database-cleanup.js --dry-run

# Then execute
node scripts/database-cleanup.js --execute
```

## Best Practices

### ✅ DO

1. **Always dry run first**

   ```bash
   node scripts/database-cleanup.js --dry-run
   ```

2. **Review reports**
   - Check logs/cleanup-report-\*.json
   - Verify counts are reasonable

3. **Backup before deep clean**

   ```bash
   mongodump --uri="mongodb://localhost:27017/gacp-dev" --out=backup/
   ```

4. **Schedule regular cleanups**
   - Daily: Light cleanup
   - Weekly: Full cleanup
   - Monthly: Deep cleanup

5. **Monitor database size**
   ```bash
   # Check size reduction
   node scripts/database-cleanup.js --dry-run
   ```

### ❌ DON'T

1. **Don't skip dry run on production**
2. **Don't run deep clean during peak hours**
3. **Don't ignore errors in reports**
4. **Don't modify retention periods without approval**
5. **Don't run multiple cleanups simultaneously**

## Security

### Environment Variables

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/gacp-dev

# Optional (for production)
MONGODB_USER=cleanup_user
MONGODB_PASSWORD=secure_password
```

### Minimal Permissions

```javascript
// MongoDB user permissions
{
  role: "readWrite",
  db: "gacp-dev",
  privileges: [
    { resource: { db: "gacp-dev", collection: "" }, actions: ["find", "remove"] },
    { resource: { db: "gacp-dev", collection: "" }, actions: ["reIndex"] }
  ]
}
```

## FAQ

### Q: Is it safe to run cleanup on production?

**A:** Yes, if you follow these steps:

1. Test on development first
2. Always dry run on production
3. Review the report
4. Backup the database
5. Execute during maintenance window

### Q: How often should I run cleanup?

**A:** Recommended schedule:

- **Light cleanup**: Daily (automated)
- **Full cleanup**: Weekly
- **Deep cleanup**: Monthly

### Q: What if I accidentally delete important data?

**A:**

1. Stop immediately
2. Restore from backup
3. Review retention policies
4. Adjust CONFIG if needed

### Q: Can I customize retention periods?

**A:** Yes, edit CONFIG in `scripts/database-cleanup.js`:

```javascript
const CONFIG = {
  EXPIRED_TOKEN_RETENTION: 7, // Change to your needs
  DRAFT_APPLICATION_RETENTION: 90, // Change to your needs
  AUDIT_LOG_RETENTION: 365 // Change to your needs
};
```

### Q: How much space will I save?

**A:** Depends on your data:

- Typical: 10-30% reduction
- Heavy: 50%+ reduction (first run)
- Ongoing: 5-10% per cleanup

### Q: Does cleanup affect performance?

**A:**

- **Light cleanup**: No impact
- **Full cleanup**: Minimal impact
- **Deep cleanup**: Brief performance hit during index rebuild

## Support

### Get Help

```bash
# Show help
node scripts/database-cleanup.js --help

# Or
.\scripts\cleanup-db.ps1 -Help
```

### Report Issues

1. Check logs: `logs/cleanup-report-*.json`
2. Include error messages
3. Describe what you were doing
4. Provide database size/statistics

## Changelog

### v1.0.0 (2025-10-16)

- ✅ Initial release
- ✅ Expired tokens cleanup
- ✅ Old drafts cleanup
- ✅ Audit logs cleanup
- ✅ Orphaned records detection
- ✅ Index optimization
- ✅ Database compaction
- ✅ Detailed reporting
- ✅ Interactive menu
- ✅ PowerShell support

---

**Created:** October 16, 2025  
**Author:** GACP Development Team  
**Version:** 1.0.0
