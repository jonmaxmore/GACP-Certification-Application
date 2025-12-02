# MongoDB Infrastructure - Quick Start Guide

## GACP Certify Flow Platform

**Last Updated**: October 15, 2025

---

## 🚀 Quick Deployment (30 minutes)

### Prerequisites

- MongoDB Atlas account
- AWS account (for S3 backups)
- kubectl configured for EKS cluster
- Terraform installed

---

## Step 1: MongoDB Atlas Setup (10 min)

```bash
# 1. Create MongoDB Atlas account: https://cloud.mongodb.com
# 2. Create Organization (or use existing)
# 3. Generate API Keys:
#    - Go to: Organization Settings → Access Manager → API Keys
#    - Create key with "Organization Owner" role
#    - Save public and private keys
```

**Get Organization ID**:

```bash
# From Atlas UI: Organization Settings → Organization ID
ORG_ID="<your-org-id>"
```

---

## Step 2: Terraform Deployment (10 min)

```bash
cd terraform

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
# MongoDB Atlas
mongodb_atlas_org_id      = "YOUR_ORG_ID_HERE"
mongodb_atlas_public_key  = "YOUR_PUBLIC_KEY_HERE"
mongodb_atlas_private_key = "YOUR_PRIVATE_KEY_HERE"
mongodb_username          = "gacp_admin"
mongodb_password          = "$(openssl rand -base64 32)"
mongodb_instance_size     = "M10"
mongodb_database_name     = "gacp_production"
alert_email               = "devops@gacp-certify.com"

# AWS
aws_region                = "ap-southeast-1"
vpc_cidr                  = "10.0.0.0/16"
EOF

# Deploy
terraform init
terraform plan
terraform apply -auto-approve
```

**Get connection string**:

```bash
terraform output mongodb_full_uri
```

---

## Step 3: Kubernetes Deployment (10 min)

```bash
cd ../k8s

# Get MongoDB URI from Terraform
MONGODB_URI=$(cd ../terraform && terraform output -raw mongodb_full_uri)

# Update secrets
kubectl create namespace gacp-production --dry-run=client -o yaml | kubectl apply -f -

# Create secret with MongoDB URI
kubectl create secret generic app-secrets \
  --from-literal=MONGODB_URI="$MONGODB_URI" \
  --from-literal=MONGODB_USERNAME="gacp_admin" \
  --from-literal=MONGODB_PASSWORD="YOUR_PASSWORD" \
  --from-literal=MONGODB_DATABASE="gacp_production" \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)" \
  --from-literal=JWT_REFRESH_SECRET="$(openssl rand -hex 32)" \
  --from-literal=SESSION_SECRET="$(openssl rand -hex 32)" \
  --from-literal=ENCRYPTION_KEY="$(openssl rand -hex 16)" \
  --namespace=gacp-production \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy application
kubectl apply -f configmaps.yaml
kubectl apply -f app-deployment.yaml
kubectl apply -f mongodb-backup-cronjob.yaml
kubectl apply -f mongodb-monitoring.yaml

# Verify
kubectl get pods -n gacp-production
kubectl logs -f -n gacp-production deployment/gacp-backend
```

---

## 🔍 Verification Commands

### Check MongoDB Connection

```bash
kubectl exec -it -n gacp-production deployment/gacp-backend -- \
  mongosh "$MONGODB_URI" --eval "db.serverStatus().host"
```

### Check MongoDB Exporter

```bash
kubectl port-forward -n gacp-production svc/mongodb-exporter 9216:9216
curl http://localhost:9216/metrics | grep "mongodb_up"
# Should return: mongodb_up 1
```

### Check Backup CronJob

```bash
kubectl get cronjob -n gacp-production
kubectl get jobs -n gacp-production | grep mongodb-backup
```

### Trigger Manual Backup

```bash
kubectl create job --from=cronjob/mongodb-backup manual-backup-$(date +%Y%m%d) -n gacp-production
kubectl logs -f -n gacp-production job/manual-backup-<date>
```

---

## 🔐 Environment Variables Reference

### Required Variables

```bash
# MongoDB
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/gacp_production?retryWrites=true&w=majority"
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_SOCKET_TIMEOUT_MS=45000

# Redis
REDIS_HOST=redis-service
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Security
JWT_SECRET=<64-char-hex>
JWT_REFRESH_SECRET=<64-char-hex>
SESSION_SECRET=<64-char-hex>
ENCRYPTION_KEY=<32-char-hex>

# AWS S3
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=gacp-production-uploads
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
```

---

## 📊 MongoDB Atlas Console

**Access**: https://cloud.mongodb.com

### Key Pages

- **Clusters**: View cluster status and metrics
- **Backup**: Access snapshots and point-in-time recovery
- **Metrics**: Real-time performance monitoring
- **Alerts**: Configure email/SMS alerts
- **Network Access**: Manage IP whitelist
- **Database Access**: Manage database users

---

## 🔄 Common Operations

### Scale MongoDB Cluster

```bash
# Update Terraform variable
cd terraform
# Edit terraform.tfvars: mongodb_instance_size = "M20"
terraform apply
```

### Restore from Backup

```bash
# Download latest backup from S3
aws s3 cp s3://gacp-production-backups/backups/mongodb/<latest>.tar.gz ./

# Restore to staging
export MONGODB_URI="<staging-uri>"
./scripts/mongodb-restore.sh <backup-file>.tar.gz
```

### View MongoDB Logs

```bash
# Application logs
kubectl logs -f -n gacp-production deployment/gacp-backend

# Backup job logs
kubectl logs -n gacp-production job/<backup-job-name>

# MongoDB exporter logs
kubectl logs -f -n gacp-production deployment/mongodb-exporter
```

### Update MongoDB Connection String

```bash
# Update secret
kubectl create secret generic app-secrets \
  --from-literal=MONGODB_URI="<new-uri>" \
  --namespace=gacp-production \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods
kubectl rollout restart deployment/gacp-backend -n gacp-production
```

---

## 🚨 Troubleshooting

### Issue: Cannot connect to MongoDB

**Check**:

```bash
# 1. Verify MongoDB URI
kubectl get secret app-secrets -n gacp-production -o jsonpath='{.data.MONGODB_URI}' | base64 -d

# 2. Test connection from pod
kubectl exec -it -n gacp-production deployment/gacp-backend -- \
  mongosh "$MONGODB_URI" --eval "db.runCommand({ping:1})"

# 3. Check IP whitelist in MongoDB Atlas Console
# Navigate to: Security → Network Access
# Ensure VPC CIDR or ALB IPs are whitelisted
```

### Issue: High replication lag

**Check**:

```bash
# View Prometheus metrics
kubectl port-forward -n gacp-production svc/mongodb-exporter 9216:9216
curl http://localhost:9216/metrics | grep replication_lag

# Check in Atlas Console: Metrics → Replication
```

**Fix**: Upgrade instance size (M10 → M20)

### Issue: Backup failed

**Check**:

```bash
# View backup job logs
kubectl logs -n gacp-production job/<failed-backup-job>

# Common causes:
# 1. MongoDB URI incorrect
# 2. S3 bucket not accessible
# 3. Insufficient storage on PVC

# Fix: Update secret or increase PVC size
kubectl edit pvc mongodb-backup-pvc -n gacp-production
```

---

## 📞 Support Contacts

- **MongoDB Atlas Support**: https://support.mongodb.com (24/7)
- **AWS Support**: https://console.aws.amazon.com/support/
- **DevOps Team**: devops@gacp-certify.com

---

## 📚 Documentation Links

- [MongoDB Integration Analysis](./MONGODB_INTEGRATION_ANALYSIS.md)
- [Backup & DR Plan](./MONGODB_BACKUP_DR_PLAN.md)
- [Day 16 Completion Report](./DAY_16_COMPLETION_REPORT.md)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

---

**Quick Start Complete!** 🎉

Your MongoDB infrastructure is now deployed and ready for production.
