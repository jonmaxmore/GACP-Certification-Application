# 🔒 Security Review Checklist for AI-Generated Code

## Pre-Commit Checklist

### Authentication & Authorization
- [ ] ทุก endpoint ที่ต้อง auth มี middleware ครบ
- [ ] Rate limiting implemented
- [ ] Session management secure
- [ ] Password hashing uses bcrypt (12+ rounds)
- [ ] JWT expiry configured correctly

### Input Validation
- [ ] ทุก user input ถูก validate
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention (sanitization)
- [ ] File upload validation (MIME + magic bytes)
- [ ] Path traversal prevention

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced
- [ ] No secrets in code/logs
- [ ] PII properly handled
- [ ] Proper error messages (no stack traces in prod)

### API Security
- [ ] CORS configured correctly
- [ ] CSRF protection enabled
- [ ] Security headers set
- [ ] API versioning implemented
- [ ] Rate limiting per endpoint

---

## Code Review Focus Areas

### High-Risk Files (ALWAYS review manually):
```
/middleware/AuthMiddleware.js
/config/JwtSecurity.js
/routes/*/auth*.js
/services/*Security*.js
*.env*
```

### Medium-Risk (Spot check):
```
/routes/**/*.js
/controllers/**/*.js
/pages/api/**/*.ts
```

### Low-Risk (Auto-approve with tests):
```
/components/ui/**/*.tsx
/utils/**/*.ts (non-security)
/tests/**/*
```

---

## Quick Security Tests

### 1. Authentication Bypass
```bash
# Try accessing protected route without token
curl http://localhost:5000/api/v2/reports/dashboard

# Expected: 401 Unauthorized
```

### 2. Rate Limiting
```bash
# Send 15 requests rapidly
for i in {1..15}; do curl http://localhost:5000/api/v2/files/upload; done

# Expected: 429 Too Many Requests after limit
```

### 3. Input Sanitization
```bash
# Try path traversal
curl http://localhost:5000/api/v2/files/../../../etc/passwd

# Expected: 400 Bad Request
```

### 4. File Upload Validation
```bash
# Try uploading .exe with PDF mime type
# Expected: Rejected by magic bytes check
```

---

## Incident Response Quick Guide

### If AI creates vulnerable code:
1. 🛑 Stop deployment immediately
2. 📝 Document the vulnerability
3. 🔍 Search for similar patterns in codebase
4. 🔧 Fix and add test case
5. 📊 Update guardrails.yaml

### If data breach detected:
1. 🛑 Isolate affected systems
2. 📞 Notify security team
3. 📝 Preserve logs for forensics
4. 🔧 Patch vulnerability
5. 📢 Notify affected users (if required)

---

*Last updated: 2024-12-13*
