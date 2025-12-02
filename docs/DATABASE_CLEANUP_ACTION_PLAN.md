# 🧹 Database Cleanup Report

**Generated:** October 16, 2025  
**Database:** gacp_production  
**Tool Version:** 2.0 (Advanced)

---

## 📊 Executive Summary

### Current State

- **Total Collections:** 32 (analyzed)
- **Empty Collections:** 24 (19 can be safely deleted)
- **Orphaned Records:** 17 records found
- **Duplicate Indexes:** 3 collections affected

### Recommended Actions

1. ✅ **Delete 19 empty collections** (safe, frees storage)
2. ✅ **Remove 17 orphaned records** (improves data integrity)
3. ⚠️ **Fix 3 duplicate indexes** (requires code changes)

### Expected Impact

- **Storage Reduction:** Minimal (collections are empty)
- **Performance:** Slight improvement
- **Data Integrity:** Significant improvement
- **Risk Level:** **LOW** (all changes are safe)

---

## 🔍 Detailed Findings

### 1. Empty Collections (24 found, 19 deletable)

#### Safe to Delete (19):

```
✓ qualitytests              - No documents
✓ qrCodes                   - No documents
✓ jobTickets                - No documents
✓ payments                  - No documents
✓ surveyResponses           - No documents
✓ notifications             - No documents
✓ cannabis_farms            - No documents
✓ fileUploads               - No documents
✓ sopRecords                - No documents
✓ harvestrecords            - No documents
✓ chemicalRegistry          - No documents
✓ reports                   - No documents
✓ sopactivities             - No documents
✓ documents                 - No documents
✓ otpRecords                - No documents
✓ farmers                   - No documents
✓ crops                     - No documents
✓ audit_logs                - No documents
✓ system.buckets.audit_logs - No documents
```

#### Keep (Core Collections - 5):

```
ℹ️ auditLogs                - Core collection (keep)
ℹ️ auditlogs                - Core collection (keep)
ℹ️ invoices                 - Core collection (keep)
ℹ️ refreshtokens            - Core collection (keep)
ℹ️ sessions                 - Core collection (keep)
```

**Recommendation:** Delete all 19 empty collections to clean up database.

---

### 2. Orphaned Records (17 found)

#### Applications without Users (16 records)

```javascript
// These applications reference non-existent users
// Likely caused by:
// - Users deleted but applications remained
// - Data import issues
// - Testing data not cleaned up

Sample IDs:
- Application 1: userId: 6710a6f9fd6e3eb7f9a295c1
- Application 2: userId: 6710a77ffd6e3eb7f9a295e5
- Application 3: userId: 6710a798fd6e3eb7f9a295f5
... (see full report for complete list)
```

**Recommendation:** Delete these 16 orphaned applications.

#### Certificates without Applications (1 record)

```javascript
// Certificate references non-existent application
// Could be:
// - Application deleted but certificate remained
// - Data integrity issue

Certificate ID: [see detailed report]
```

**Recommendation:** Delete this 1 orphaned certificate.

---

### 3. Duplicate Indexes (3 collections affected)

#### users collection (1 duplicate)

```javascript
// Problem: Schema has both "index: true" and schema.index()
// Location: database/models/User.model.js

// Current (WRONG):
userId: {
  type: String,
  required: true,
  unique: true,
  index: true  // <-- Remove this
}

// Then also has:
UserSchema.index({ userId: 1 }, { unique: true }); // Duplicate!

// Solution: Remove "index: true", keep schema.index() only
userId: {
  type: String,
  required: true,
  unique: true
  // index: true removed
}
```

#### certificates collection (1 duplicate)

```javascript
// Same issue in Certificate.model.js
certificateId: {
  type: String,
  index: true  // <-- Remove this
}

CertificateSchema.index({ certificateId: 1 }, { unique: true }); // Keep this
```

#### invoices collection (1 duplicate)

```javascript
// Same issue in Invoice.model.js
invoiceId: {
  type: String,
  index: true  // <-- Remove this
}

InvoiceSchema.index({ invoiceId: 1 }, { unique: true }); // Keep this
```

**Recommendation:** Fix model files by removing `index: true` from field definitions.

---

## 🎯 Action Plan

### Phase 1: Safe Cleanup (Immediate - 5 minutes)

#### Step 1: Delete Empty Collections

```bash
# Preview first (SAFE)
node scripts/advanced-database-cleanup.js --dry-run

# Then execute
node scripts/advanced-database-cleanup.js --execute
```

**Expected Result:**

- 19 empty collections removed
- Database more organized
- No functional impact

#### Step 2: Remove Orphaned Records

```bash
# Automatically handled by cleanup tool
# Will delete:
# - 16 orphaned applications
# - 1 orphaned certificate
```

**Expected Result:**

- Improved data integrity
- No orphaned references
- Clean relationships

---

### Phase 2: Fix Duplicate Indexes (Next Deployment - 15 minutes)

#### Step 1: Update User Model

```bash
# Edit: database/models/User.model.js
```

**Changes:**

```javascript
// BEFORE (lines with issue):
userId: { type: String, required: true, unique: true, index: true },
email: { type: String, required: true, unique: true, index: true },
thaiId: { type: String, index: true, sparse: true },
phoneNumber: { type: String, index: true, sparse: true },

// AFTER (remove index: true):
userId: { type: String, required: true, unique: true },
email: { type: String, required: true, unique: true },
thaiId: { type: String, sparse: true },
phoneNumber: { type: String, sparse: true },

// Keep schema.index() calls at bottom - they are correct
```

#### Step 2: Update Certificate Model

```bash
# Edit: database/models/Certificate.model.js
```

**Changes:**

```javascript
// BEFORE:
certificateId: { type: String, required: true, unique: true, index: true },
certificateNumber: { type: String, required: true, unique: true, index: true },

// AFTER:
certificateId: { type: String, required: true, unique: true },
certificateNumber: { type: String, required: true, unique: true },
```

#### Step 3: Update Invoice Model

```bash
# Edit: database/models/Invoice.model.js
```

**Changes:**

```javascript
// BEFORE:
invoiceId: { type: String, required: true, unique: true, index: true },
invoiceNumber: { type: String, required: true, unique: true, index: true },
sequenceNumber: { type: Number, required: true, index: true },

// AFTER:
invoiceId: { type: String, required: true, unique: true },
invoiceNumber: { type: String, required: true, unique: true },
sequenceNumber: { type: Number, required: true },
```

#### Step 4: Rebuild Indexes

```bash
# After code changes, rebuild indexes
node scripts/advanced-database-cleanup.js --execute --fix-indexes
```

---

## ⚠️ Safety Considerations

### Before Cleanup:

1. ✅ **Backup Database**

   ```bash
   mongodump --uri="mongodb://localhost:27017/gacp_production" --out=backup/
   ```

2. ✅ **Test on Development First**

   ```bash
   # Change MONGODB_URI to dev database
   node scripts/advanced-database-cleanup.js --execute
   ```

3. ✅ **Review Dry Run**
   ```bash
   node scripts/advanced-database-cleanup.js --dry-run
   ```

### During Cleanup:

- ✅ Run during low-traffic period
- ✅ Monitor for errors
- ✅ Keep backup ready

### After Cleanup:

- ✅ Verify application works
- ✅ Check logs for errors
- ✅ Confirm data integrity

---

## 📈 Expected Benefits

### Immediate Benefits:

1. **Cleaner Database**
   - Remove 19 unused collections
   - Better organization

2. **Better Data Integrity**
   - No orphaned records
   - Clean references

3. **Easier Maintenance**
   - Less clutter
   - Faster backups

### Long-term Benefits:

1. **Performance**
   - Fewer collections to scan
   - Cleaner indexes

2. **Development**
   - Less confusing schema
   - Clear data model

3. **Debugging**
   - Easier to understand
   - Faster troubleshooting

---

## 🔧 Implementation Guide

### For DevOps Team:

**1. Schedule Maintenance Window**

- Duration: 30 minutes
- Best Time: Off-peak hours (2-4 AM)
- Backup: Yes (before changes)

**2. Preparation Checklist**

```bash
# 1. Backup
mongodump --uri="mongodb://localhost:27017/gacp_production" --out=backup/gacp_$(date +%Y%m%d)

# 2. Test on dev
export MONGODB_URI="mongodb://localhost:27017/gacp-dev"
node scripts/advanced-database-cleanup.js --dry-run

# 3. Review report
cat logs/advanced-cleanup-*.json

# 4. Confirm with team
```

**3. Execution Steps**

```bash
# Step 1: Analyze
node scripts/advanced-database-cleanup.js --analyze

# Step 2: Dry run
node scripts/advanced-database-cleanup.js --dry-run

# Step 3: Execute
node scripts/advanced-database-cleanup.js --execute

# Step 4: Verify
mongo gacp_production --eval "db.getCollectionNames()"

# Step 5: Test application
curl http://localhost:3000/health
```

**4. Rollback Plan**

```bash
# If issues occur:
mongorestore --uri="mongodb://localhost:27017/gacp_production" backup/gacp_YYYYMMDD/
```

---

### For Development Team:

**1. Fix Model Files** (after cleanup)

Edit these files:

- `database/models/User.model.js`
- `database/models/Certificate.model.js`
- `database/models/Invoice.model.js`

Remove `index: true` from field definitions where `schema.index()` already exists.

**2. Test Changes**

```bash
# Run tests
npm test

# Check for duplicate index warnings
npm start 2>&1 | grep "Duplicate"
```

**3. Deploy**

```bash
# Commit changes
git add database/models/
git commit -m "fix: Remove duplicate index definitions"

# Deploy to staging first
git push origin staging

# Then production
git push origin main
```

---

## 📞 Support

### If Issues Occur:

**1. Backup Restore:**

```bash
mongorestore --uri="mongodb://localhost:27017/gacp_production" backup/
```

**2. Revert Code Changes:**

```bash
git revert <commit-hash>
```

**3. Check Logs:**

```bash
cat logs/advanced-cleanup-*.json
tail -f logs/app.log
```

### Contact:

- **DevOps Lead:** [Contact Info]
- **Database Admin:** [Contact Info]
- **Development Team:** [Contact Info]

---

## 📝 Appendix

### A. Full Command Reference

```bash
# Analyze only
node scripts/advanced-database-cleanup.js --analyze

# Dry run (preview)
node scripts/advanced-database-cleanup.js --dry-run

# Execute cleanup
node scripts/advanced-database-cleanup.js --execute

# Execute with index fixes
node scripts/advanced-database-cleanup.js --execute --fix-indexes

# Help
node scripts/advanced-database-cleanup.js --help
```

### B. Report Locations

```
logs/advanced-cleanup-{timestamp}.json
logs/cleanup-report-{timestamp}.json
logs/database-analysis-{timestamp}.json
```

### C. Related Documentation

- [Database Cleanup Guide](./DATABASE_CLEANUP_GUIDE.md)
- [MongoDB Best Practices](./MONGODB_BEST_PRACTICES.md)
- [Backup and Restore Guide](./BACKUP_RESTORE_GUIDE.md)

---

**Report Generated:** October 16, 2025  
**Next Review:** November 16, 2025  
**Status:** ✅ Ready for implementation
