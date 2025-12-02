# Final Deployment Checklist

Date: October 31, 2025

## Deployment Team

- **Deployment Lead:** _Assign owner_
- **DevOps Engineer:** _Assign owner_
- **QA Observer:** _Assign owner_

## Pre-Deployment Requirements

| Item | Description | Status | Owner | Evidence |
|------|-------------|--------|-------|----------|
| Verification report | `FINAL_VERIFICATION_REPORT.md` completed and signed | ⏳ | _Name_ | _Link_ |
| Integration tests | `INTEGRATION_TEST_RESULTS.md` approved | ⏳ | _Name_ | _Link_ |
| Secrets review | `node scripts/security/secrets-audit.js` run and clear | ⏳ | _Name_ | _Attach log_ |
| Infra plan | Terraform plan reviewed and approved | ✅ | _Name_ | _Attach plan_ |

## Infrastructure Steps

| Step | Command | Status | Notes |
|------|---------|--------|-------|
| Terraform apply | `cd infrastructure/aws && terraform apply` | ⏳ | Confirm staging/prod workspace |
| Backend image build | `cd ../../apps/backend && docker build -t gacp-backend .` | ⏳ | Tag with git SHA |
| Push image to ECR | `docker push <ECR_URL>/gacp-backend:latest` | ⏳ | Replace placeholder before run |
| Update ECS service | Terraform outputs or AWS Console | ⏳ | Record service deployment ID |

## Frontend Build & Deploy

| Portal | Build Command | Deploy Target | Status | Notes |
|--------|---------------|---------------|--------|-------|
| Farmer Portal | `npm run build` | S3/CloudFront or ECS | ⏳ | Include artifact path |
| Admin Portal | `npm run build` | S3/CloudFront or ECS | ⏳ | _Notes_ |
| Certificate Portal | `npm run build` | S3/CloudFront or ECS | ⏳ | Detail page validation required |
| Track & Trace UI | `npm run build` | S3/CloudFront or ECS | ⚠️ | UI pending |

## Post-Deploy Smoke Tests

| Endpoint / Route | Expected | Result | Evidence |
|------------------|----------|--------|----------|
| `/health` | 200 OK | _Record_ | _Screenshot/log_ |
| `/applications` | Returns applications list | _Record_ | _Attach JSON_ |
| `/certificates` | Returns certificate summary | _Record_ | _Attach JSON_ |
| `/trace` | Returns trace history | _Record_ | _Attach JSON_ |
| Farmer portal dashboard | Loads without blank sections | _Record_ | _Screenshot_ |
| Certificate verify page | Accepts certificate ID | _Record_ | _Screenshot_ |

## Cost-Optimized Setup Tasks

| Task | Action | Status | Owner | Notes |
|------|--------|--------|-------|-------|
| MongoDB free tier | Use Atlas M0 or EC2 self-hosted | ⏳ | _Name_ | Track future DocumentDB migration |
| Redis replacement | Run Redis via local Docker container | ⏳ | _Name_ | Document container command |
| Static hosting | Deploy portals via S3 + CloudFront free tier | ⏳ | _Name_ | Include distribution ID |
| DocumentDB migration plan | Schedule for month 11 | ⏳ | _Name_ | Capture in roadmap |

## Final Sign-off

1. Verify all tables above show ✅ or equivalent evidence.
2. Capture CloudWatch log URLs for backend services.
3. Update `SYSTEM_OVERVIEW.md` with final architecture notes.
4. Tag release:

   ```bash
   git tag v1.0.0-production-ready
   git push origin v1.0.0-production-ready
   ```

5. Notify stakeholders with links to verification, integration, and deployment documents.

## Approvals

- **DevOps Lead:** _Sign & Date_
- **Engineering Manager:** _Sign & Date_
- **Product Owner:** _Sign & Date_
