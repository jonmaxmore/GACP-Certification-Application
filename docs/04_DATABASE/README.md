# 💾 04 - Database

**Category**: Database Setup & Management  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains MongoDB setup guides, integration documentation, and backup/disaster recovery plans.

---

## 📚 Documents in this Folder

### 1. ⭐ [MONGODB_QUICK_START.md](./MONGODB_QUICK_START.md)

Quick start guide for MongoDB setup

**Contents:**

- Installation guide (Docker + Local)
- Initial configuration
- Database creation
- User setup
- Basic operations
- Connection strings

**Who should read:** All developers, MIS

---

### 2. [MONGODB_INTEGRATION_ANALYSIS.md](./MONGODB_INTEGRATION_ANALYSIS.md)

MongoDB integration analysis and best practices

**Contents:**

- Integration patterns
- Schema design decisions
- Index strategies
- Query optimization
- Connection pooling
- Error handling

**Who should read:** Backend developers, DBA

---

### 3. [MONGODB_BACKUP_DR_PLAN.md](./MONGODB_BACKUP_DR_PLAN.md)

Backup and disaster recovery plan

**Contents:**

- Backup strategy (daily, weekly, monthly)
- Backup procedures
- Restore procedures
- Disaster recovery plan
- RTO/RPO targets
- Testing schedule

**Who should read:** MIS, DevOps, DBA

---

## 🎯 Quick Start

### Setup MongoDB (Docker):

```bash
# Start MongoDB with Docker Compose
docker-compose up -d mongodb

# Verify it's running
docker ps | grep mongodb

# Access MongoDB shell
docker exec -it gacp-mongodb mongosh
```

### Setup MongoDB (Local):

```bash
# Install MongoDB (Windows)
winget install MongoDB.Server

# Start MongoDB service
net start MongoDB

# Access MongoDB shell
mongosh
```

### Create Database:

```javascript
// Connect to MongoDB
use gacp_db

// Create collections
db.createCollection('users')
db.createCollection('applications')
db.createCollection('farms')
db.createCollection('job_tickets')

// Create admin user
db.createUser({
  user: 'gacp_admin',
  pwd: 'your_secure_password',
  roles: ['readWrite', 'dbAdmin']
})
```

---

## 📊 Database Schema Overview

### Collections (16):

```
1. users                    - User accounts
2. applications             - GACP applications
3. farms                    - Farm profiles
4. crops                    - Crop management
5. sop_records              - SOP tracking (5 steps)
6. chemicals                - Chemical registry
7. documents                - Document uploads
8. payments                 - Payment records
9. certificates             - Certificates issued
10. job_tickets             - DTAM job tickets
11. inspections             - Inspection reports
12. qr_codes                - QR code tracking
13. surveys                 - Survey responses
14. notifications           - User notifications
15. audit_logs              - System audit logs
16. system_configs          - System configuration
```

### Key Relationships:

```
users → applications (1:N)
applications → documents (1:N)
applications → payments (1:N)
applications → job_tickets (1:N)
applications → certificates (1:1)
farms → crops (1:N)
farms → sop_records (1:N)
crops → sop_records (1:N)
job_tickets → inspections (1:1)
```

---

## 🔒 Backup Strategy

### Daily Backups:

```
Time: 2:00 AM (Thailand time)
Method: mongodump
Retention: 7 days
Storage: S3 bucket (encrypted)
```

### Weekly Backups:

```
Time: Sunday 2:00 AM
Method: Full snapshot
Retention: 4 weeks
Storage: S3 bucket + Local NAS
```

### Monthly Backups:

```
Time: 1st of month, 2:00 AM
Method: Full snapshot
Retention: 12 months
Storage: S3 Glacier (long-term)
```

### Disaster Recovery:

```
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour
Backup locations: Primary (S3) + Secondary (Local NAS)
Testing: Monthly DR drills
```

---

## 🔗 Related Documentation

- **System Architecture**: [../01_SYSTEM_ARCHITECTURE/SA_SE_SYSTEM_ARCHITECTURE.md](../01_SYSTEM_ARCHITECTURE/SA_SE_SYSTEM_ARCHITECTURE.md)
- **Deployment Guide**: [../05_DEPLOYMENT/DEPLOYMENT_GUIDE.md](../05_DEPLOYMENT/DEPLOYMENT_GUIDE.md)
- **API Documentation**: [../../docs/API_DOCUMENTATION.md](../../docs/API_DOCUMENTATION.md)

---

## 📞 Contact

**Database Administration:**

- MIS Lead: คุณสมคำ - somkam@gacp.go.th
- DevOps: devops@gacp.go.th

**Slack Channels:**

- #gacp-database
- #gacp-devops

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: Workflows](../03_WORKFLOWS/)
- ➡️ [Next: Deployment](../05_DEPLOYMENT/)
