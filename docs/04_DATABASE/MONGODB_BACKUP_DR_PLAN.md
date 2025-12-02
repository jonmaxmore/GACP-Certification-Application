# MongoDB Backup & Disaster Recovery Plan

## GACP Certify Flow Platform

**Document Version**: 1.0  
**Last Updated**: October 15, 2025  
**Owner**: DevOps Team

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Backup Procedures](#backup-procedures)
4. [Restore Procedures](#restore-procedures)
5. [Disaster Recovery](#disaster-recovery)
6. [Testing & Validation](#testing--validation)
7. [Contact Information](#contact-information)

---

## Overview

### Purpose

This document outlines the backup and disaster recovery procedures for the GACP Certify Flow platform's MongoDB Atlas database.

### Objectives

- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour
- **Data Retention**: 30 days for daily backups, 12 months for monthly backups

### Database Information

- **Database**: MongoDB Atlas M10 Cluster
- **Location**: AWS ap-southeast-1 (Bangkok)
- **Replica Set**: 3-node cluster
- **Collections**: 16+ collections (~10-50 GB estimated)

---

## Backup Strategy

### 1. MongoDB Atlas Continuous Backups

MongoDB Atlas provides **continuous cloud backups** with point-in-time recovery:

- **Snapshot Frequency**: Every 24 hours (2:00 AM Bangkok time)
- **Retention Policy**:
  - Daily snapshots: 7 days
  - Weekly snapshots: 4 weeks
  - Monthly snapshots: 12 months
- **Point-in-Time Recovery**: Available for last 7 days

**Advantages**:

- ✅ Automatic and managed by MongoDB Atlas
- ✅ Point-in-time recovery capability
- ✅ No performance impact on production
- ✅ Cross-region backup storage

### 2. Application-Level Backups (mongodump)

Additional backups using `mongodump` for extra safety:

- **Frequency**: Daily at 2:00 AM Bangkok time (via Kubernetes CronJob)
- **Storage**: AWS S3 bucket (`gacp-production-backups`)
- **Format**: Compressed GZIP archives
- **Retention**: 30 days
- **Encryption**: AES-256 (AWS S3 server-side encryption)

**Advantages**:

- ✅ Portable backup format
- ✅ Can be restored to different MongoDB versions
- ✅ Stored in separate AWS account (for extra security)
- ✅ Supports selective database/collection restore

---

## Backup Procedures

### Automated Daily Backups

#### Kubernetes CronJob

The backup runs automatically via Kubernetes CronJob:

```bash
# Check backup CronJob status
kubectl get cronjob mongodb-backup -n gacp-production

# View recent backup jobs
kubectl get jobs -n gacp-production | grep mongodb-backup

# View backup job logs
kubectl logs -n gacp-production job/mongodb-backup-<timestamp>
```

#### Backup Script Execution

Manual backup can be triggered:

```bash
# Set environment variables
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/gacp_production"
export AWS_S3_BUCKET="gacp-production-backups"
export AWS_REGION="ap-southeast-1"

# Run backup script
./scripts/mongodb-backup.sh custom-backup-name
```

**Backup Output**:

```
backups/mongodb/
├── mongodb-backup-20251015-020000.tar.gz  (compressed backup)
└── backup-info.json                        (metadata)
```

### Manual On-Demand Backup

For critical changes (e.g., major releases, schema changes):

```bash
# Trigger manual backup job
kubectl create job --from=cronjob/mongodb-backup mongodb-manual-backup-$(date +%Y%m%d) -n gacp-production

# Monitor backup progress
kubectl logs -f -n gacp-production job/mongodb-manual-backup-<date>
```

### MongoDB Atlas Backup

Access MongoDB Atlas backups:

1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com)
2. Navigate to: **Clusters** → **gacp-production** → **Backup**
3. View available snapshots and point-in-time restore options

---

## Restore Procedures

### Scenario 1: Restore from Application Backup (Full)

**Use Case**: Complete database corruption or accidental deletion

```bash
# 1. Download backup from S3
aws s3 cp s3://gacp-production-backups/backups/mongodb/mongodb-backup-20251015-020000.tar.gz ./

# 2. Set MongoDB connection (to staging or new cluster)
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/gacp_staging"

# 3. Run restore script
./scripts/mongodb-restore.sh mongodb-backup-20251015-020000.tar.gz

# 4. Verify restore
mongo "$MONGODB_URI" --eval "db.applications.count()"
```

**Estimated Time**: 1-2 hours (depending on database size)

### Scenario 2: Restore Specific Database

```bash
# Restore only specific database
./scripts/mongodb-restore.sh mongodb-backup-20251015-020000.tar.gz gacp_production
```

### Scenario 3: MongoDB Atlas Snapshot Restore

**Use Case**: Point-in-time recovery or recent corruption

1. **Access MongoDB Atlas Console**
2. **Navigate to Backup Tab**:
   - Select cluster: `gacp-production`
   - Click **"Restore"** on desired snapshot
3. **Choose Restore Option**:
   - **Option A**: Restore to new cluster (recommended for verification)
   - **Option B**: Replace existing cluster (production downtime)
4. **Configure Restore**:
   - Cluster name: `gacp-production-restored`
   - Instance size: Same as production (M10)
   - Region: ap-southeast-1
5. **Initiate Restore**: Typically takes 15-30 minutes
6. **Update Connection Strings**: Update application to use restored cluster

**Estimated Time**: 30 minutes to 1 hour

### Scenario 4: Point-in-Time Recovery (Last 7 Days)

MongoDB Atlas supports restoring to any point in time within the last 7 days:

1. **Access MongoDB Atlas Console** → **Backup**
2. **Click "Point in Time"**
3. **Select Date & Time**: Choose exact timestamp before incident
4. **Choose Restore Method**:
   - Download: Download backup files
   - Restore to Cluster: Create new cluster with restored data
5. **Verify Data**: Test restored cluster before production cutover

**Estimated Time**: 1-2 hours

---

## Disaster Recovery

### Disaster Scenarios & Response

#### Scenario 1: Data Center Outage (AWS ap-southeast-1)

**Impact**: Production database unavailable

**Response**:

1. ✅ **MongoDB Atlas automatically fails over** to replica in another AZ
2. ✅ **No manual intervention required** (automatic in < 30 seconds)
3. ✅ Application auto-reconnects via connection string
4. ✅ Monitor replication lag after recovery

**RTO**: < 5 minutes  
**RPO**: 0 (no data loss with replica set)

---

#### Scenario 2: Accidental Data Deletion

**Impact**: Critical data deleted by user or application bug

**Response**:

1. **Immediately stop application** (prevent further changes)

   ```bash
   kubectl scale deployment gacp-backend --replicas=0 -n gacp-production
   ```

2. **Restore from MongoDB Atlas point-in-time** (to new cluster)
   - Restore to 5 minutes before deletion
   - Verify data integrity

3. **Extract deleted data**:

   ```bash
   mongoexport --uri="mongodb+srv://..." --collection=applications --query='{"deletedAt": {"$gte": "2025-10-15T10:00:00Z"}}' --out=recovered-data.json
   ```

4. **Import to production**:

   ```bash
   mongoimport --uri="$PRODUCTION_URI" --collection=applications --file=recovered-data.json
   ```

5. **Restart application**

**RTO**: 2-4 hours  
**RPO**: < 1 hour

---

#### Scenario 3: Database Corruption

**Impact**: Database cannot start or has corrupted collections

**Response**:

1. **Check MongoDB Atlas status** (Atlas handles repair automatically)
2. **If Atlas cannot auto-repair**:
   - Restore latest healthy snapshot (automated backups)
   - MongoDB Atlas typically has multiple backup copies
3. **For application-level corruption**:
   - Restore from mongodump backup
   - Run data validation scripts:
   ```bash
   mongo "$MONGODB_URI" --eval "db.applications.validate({full: true})"
   ```

**RTO**: 1-2 hours  
**RPO**: < 24 hours

---

#### Scenario 4: Complete MongoDB Atlas Account Compromise

**Impact**: Atlas account deleted or inaccessible

**Response**:

1. **Contact MongoDB Atlas Support immediately**
   - Support: https://support.mongodb.com
   - Phone: +1-866-237-8815

2. **Restore from S3 backups**:
   - Create new MongoDB Atlas cluster (or self-hosted)
   - Download latest backup from S3
   - Restore using mongorestore script

3. **Update application connection strings**

4. **Enable MFA and review security** after recovery

**RTO**: 4-6 hours  
**RPO**: < 24 hours

---

### Disaster Recovery Checklist

#### Before Disaster

- [ ] Verify backups are running daily (check last 7 days)
- [ ] Test restore procedure monthly
- [ ] Maintain up-to-date runbook (this document)
- [ ] Ensure team has access to MongoDB Atlas console
- [ ] Verify S3 backup bucket accessibility
- [ ] Document all API keys and credentials in secure vault

#### During Disaster

- [ ] Assess impact and determine scenario
- [ ] Notify stakeholders (management, users)
- [ ] Execute appropriate recovery procedure
- [ ] Document all actions taken
- [ ] Monitor system health during recovery

#### After Disaster

- [ ] Conduct post-mortem analysis
- [ ] Update runbook based on lessons learned
- [ ] Review and improve backup strategy
- [ ] Test restored system thoroughly
- [ ] Communicate resolution to stakeholders

---

## Testing & Validation

### Monthly Backup Test

**Schedule**: First Monday of each month at 10:00 AM

**Procedure**:

1. Download latest backup from S3
2. Restore to staging MongoDB cluster
3. Verify data integrity:
   ```bash
   # Count documents in all collections
   mongo "$STAGING_URI" --eval "db.getCollectionNames().forEach(function(col) { print(col + ': ' + db[col].count()); })"
   ```
4. Run smoke tests on staging application
5. Document results in test log

**Success Criteria**:

- ✅ Backup file downloads successfully
- ✅ Restore completes without errors
- ✅ Document counts match production (within 24-hour window)
- ✅ Application connects and operates normally

### Quarterly DR Drill

**Schedule**: Quarterly (Jan, Apr, Jul, Oct)

**Procedure**:

1. Simulate disaster scenario (e.g., data center outage)
2. Follow DR procedures from runbook
3. Measure RTO and RPO
4. Document issues and improvements
5. Update runbook

---

## Backup Monitoring

### Automated Alerts

Prometheus alerts configured for backup failures:

```yaml
# Alert when backup CronJob fails
alert: MongoDBBackupFailed
expr: kube_job_status_failed{job_name=~"mongodb-backup.*"} > 0
for: 5m
severity: critical
```

### Manual Checks

Weekly verification:

```bash
# Check recent backups in S3
aws s3 ls s3://gacp-production-backups/backups/mongodb/ --recursive | tail -n 10

# Verify backup sizes (should be consistent)
aws s3 ls s3://gacp-production-backups/backups/mongodb/ --recursive --human-readable | grep "$(date +%Y-%m)"
```

---

## Contact Information

### Emergency Contacts

| Role            | Name   | Phone   | Email                   |
| --------------- | ------ | ------- | ----------------------- |
| **DevOps Lead** | [Name] | [Phone] | devops@gacp-certify.com |
| **DBA**         | [Name] | [Phone] | dba@gacp-certify.com    |
| **CTO**         | [Name] | [Phone] | cto@gacp-certify.com    |

### External Support

- **MongoDB Atlas Support**: https://support.mongodb.com (24/7)
- **AWS Support**: https://console.aws.amazon.com/support/ (Business Plan)

---

## Appendix

### Backup File Naming Convention

```
mongodb-backup-YYYYMMDD-HHMMSS.tar.gz

Example: mongodb-backup-20251015-020000.tar.gz
```

### Backup File Structure

```
mongodb-backup-20251015-020000/
├── gacp_production/
│   ├── applications.bson.gz
│   ├── applications.metadata.json
│   ├── certificates.bson.gz
│   ├── certificates.metadata.json
│   └── ... (other collections)
└── backup-info.json
```

### Useful Commands

```bash
# Check MongoDB Atlas cluster status
atlas clusters describe gacp-production

# List all backups
atlas backups snapshots list gacp-production

# Trigger manual Atlas backup
atlas backups snapshots create gacp-production

# Test MongoDB connection
mongosh "$MONGODB_URI" --eval "db.serverStatus()"

# Check database size
mongosh "$MONGODB_URI" --eval "db.stats(1024*1024)" # Size in MB
```

---

**Document End**

_For questions or updates to this document, contact: devops@gacp-certify.com_
