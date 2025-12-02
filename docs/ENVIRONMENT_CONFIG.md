# Environment Configuration Management

## Overview

This document describes how to manage environment variables and secrets for the GACP Certify Flow application across different environments.

## Environment Files

### Available Environments

- **Development** (`.env.development`) - Local development
- **Staging** (`.env.staging`) - Testing and QA
- **Production** (`.env.production`) - Live production environment

### Setup Instructions

1. **Copy Example File**

   ```bash
   cp .env.example .env.development
   ```

2. **Fill in Values**
   - Replace all placeholder values with actual secrets
   - Generate secure random strings for secrets
   - Use environment-specific values

3. **Never Commit Secrets**
   - `.env.*` files are in `.gitignore`
   - Use secrets management tools for production
   - Document required variables only

## Secret Generation

### Generate Secure Random Strings

```bash
# For SESSION_SECRET, JWT_SECRET, etc. (64 characters)
openssl rand -hex 32

# For ENCRYPTION_KEY (32 characters)
openssl rand -hex 16

# For BASE64 encoded secrets
openssl rand -base64 32
```

## Environment-Specific Configuration

### Development

- Use local PostgreSQL and Redis
- Mock external services when possible
- Enable debug logging
- Use test payment gateway credentials
- Disable email sending or use MailHog/Mailtrap

### Staging

- Use AWS RDS and ElastiCache
- Test mode for payment gateways
- Enable Sentry error tracking
- Use SendGrid for emails
- Moderate logging (info level)

### Production

- Multi-AZ RDS with read replicas
- Redis cluster with failover
- Live payment gateway credentials
- Strict security settings
- Minimal logging (warn/error only)
- Enable all monitoring and alerting

## Secrets Management

### Kubernetes Secrets

```bash
# Create secret from .env file
kubectl create secret generic app-secrets \
  --from-env-file=.env.production \
  -n gacp-production

# Update existing secret
kubectl create secret generic app-secrets \
  --from-env-file=.env.production \
  --dry-run=client -o yaml | kubectl apply -f -

# View secret
kubectl get secret app-secrets -n gacp-production -o yaml

# Decode secret value
kubectl get secret app-secrets \
  -n gacp-production \
  -o jsonpath='{.data.JWT_SECRET}' | base64 --decode
```

### AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name gacp-production-secrets \
  --secret-string file://.env.production

# Update secret
aws secretsmanager update-secret \
  --secret-id gacp-production-secrets \
  --secret-string file://.env.production

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id gacp-production-secrets \
  --query SecretString --output text
```

### GitHub Secrets (for CI/CD)

Required secrets in GitHub repository settings:

```
# Docker Registry
DOCKER_USERNAME
DOCKER_PASSWORD

# AWS Credentials
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Application Secrets
DATABASE_URL
JWT_SECRET
SESSION_SECRET
REDIS_HOST
SENTRY_DSN
SENTRY_AUTH_TOKEN

# Notification
SLACK_WEBHOOK_URL
```

## Feature Flags

Feature flags allow enabling/disabling features without code changes:

| Flag                         | Description                | Default                      |
| ---------------------------- | -------------------------- | ---------------------------- |
| `FEATURE_EMAIL_VERIFICATION` | Require email verification | `true`                       |
| `FEATURE_TWO_FACTOR_AUTH`    | Enable 2FA                 | `false` (dev), `true` (prod) |
| `FEATURE_PAYMENT_GATEWAY`    | Enable payment processing  | `true`                       |
| `FEATURE_FILE_UPLOAD`        | Allow file uploads         | `true`                       |
| `FEATURE_NOTIFICATIONS`      | Send notifications         | `true`                       |
| `FEATURE_ANALYTICS`          | Track analytics            | `false` (dev), `true` (prod) |
| `FEATURE_MAINTENANCE_MODE`   | Show maintenance page      | `false`                      |

## Security Best Practices

### Password Requirements

- **Development**: Minimum 8 characters
- **Staging**: Minimum 10 characters
- **Production**: Minimum 12 characters
- All environments require: uppercase, lowercase, number, special character

### Encryption

- All sensitive data encrypted at rest
- TLS/SSL for data in transit
- Database encryption enabled in staging/production
- Redis TLS enabled in staging/production

### Session Management

- Secure cookies in production (HTTPS only)
- HttpOnly flag to prevent XSS
- SameSite=Strict in production
- 24-hour session expiration

### JWT Configuration

- Short access token lifetime (15 minutes)
- Longer refresh token lifetime (7 days)
- HS256 algorithm for signing
- Rotate secrets regularly

## Environment Variables Reference

### Critical Variables (Must Set)

```bash
# Database
DATABASE_URL
DB_PASSWORD

# Security
JWT_SECRET
JWT_REFRESH_SECRET
SESSION_SECRET
ENCRYPTION_KEY

# AWS (if using S3)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Email (if sending emails)
SMTP_USER
SMTP_PASSWORD

# Payment (if accepting payments)
PROMPTPAY_API_KEY
OMISE_SECRET_KEY
```

### Optional Variables

```bash
# Error Tracking
SENTRY_DSN

# Metrics
PROMETHEUS_ENDPOINT

# CloudWatch
CLOUDWATCH_LOG_GROUP
```

## Troubleshooting

### Missing Required Variables

If application fails to start:

1. Check logs for "Missing required environment variable" errors
2. Verify all critical variables are set
3. Ensure no typos in variable names
4. Check that values are properly quoted if they contain special characters

### Database Connection Issues

```bash
# Test database connection
docker run --rm postgres:15 psql $DATABASE_URL -c "SELECT version();"

# Verify SSL settings
# If DB_SSL=true, ensure certificate is available
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

# With password
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

## CI/CD Integration

### GitHub Actions

Environment variables are loaded from GitHub Secrets:

```yaml
env:
  NODE_ENV: ${{ vars.NODE_ENV }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

### Docker Compose

```yaml
services:
  app:
    env_file:
      - .env.${NODE_ENV:-development}
```

### Kubernetes

```yaml
envFrom:
  - configMapRef:
      name: app-config
  - secretRef:
      name: app-secrets
```

## Rotation Schedule

### Recommended Secret Rotation

| Secret             | Frequency | Priority |
| ------------------ | --------- | -------- |
| JWT_SECRET         | 90 days   | High     |
| SESSION_SECRET     | 90 days   | High     |
| Database passwords | 180 days  | High     |
| API keys           | 180 days  | Medium   |
| Encryption keys    | 1 year    | Medium   |

### Rotation Process

1. Generate new secret value
2. Add new value alongside old value (dual write)
3. Deploy application update
4. Remove old value after grace period
5. Update documentation

## Monitoring

### Required Monitoring

- Database connection pool status
- Redis connection status
- API rate limit hits
- Failed authentication attempts
- Payment gateway errors
- Email delivery failures

### Alerts

Configure alerts for:

- Database connection failures
- High error rates (>10/minute)
- Slow API responses (>5 seconds)
- Failed deployments
- Security incidents

## Support

For questions about environment configuration:

- Check this documentation first
- Review `.env.example` for all available options
- Contact DevOps team for production secrets
- See Terraform outputs for AWS resource endpoints
