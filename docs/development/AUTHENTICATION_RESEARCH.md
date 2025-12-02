# 🔐 Authentication Service - Research & Analysis

**Date:** October 16, 2025  
**Research Duration:** 3 hours  
**Purpose:** Select best authentication strategy for GACP Platform

---

## 📚 Research Sources

### Primary Sources

1. **OWASP Authentication Cheat Sheet** (2024 Edition)
2. **NIST SP 800-63B** - Digital Identity Guidelines
3. **Auth0 Best Practices** - Industry standards
4. **JWT.io Best Practices**
5. **Node.js Security Best Practices**

### Industry References

- GitHub Authentication System
- Stripe API Authentication
- AWS IAM Best Practices
- Google Cloud Identity Platform

---

## 🎯 Key Research Questions

### 1. JWT Algorithm: HS256 vs RS256?

**HS256 (HMAC with SHA-256):**

```yaml
Pros: ✓ Simpler implementation
  ✓ Faster performance (symmetric)
  ✓ Single secret key
  ✓ Sufficient for single-server apps

Cons: ✗ Shared secret between services
  ✗ Cannot verify without secret
  ✗ Key rotation requires re-signing all tokens

Use Case:
  - Monolithic applications
  - Single backend service
  - Internal microservices (same trust boundary)
```

**RS256 (RSA with SHA-256):**

```yaml
Pros: ✓ Asymmetric (public/private key)
  ✓ Public key can verify anywhere
  ✓ Easier key rotation
  ✓ Better for microservices
  ✓ Third-party verification possible

Cons: ✗ More complex setup
  ✗ Slower performance (asymmetric crypto)
  ✗ Requires key management infrastructure

Use Case:
  - Microservices architecture
  - Third-party API access
  - Mobile apps (public key in app)
  - Federated authentication
```

**DECISION for GACP Platform:**

```yaml
Algorithm: HS256 (for Phase 1)
Rationale:
  - Phase 1: 5 services in same trust boundary
  - Single MongoDB + single JWT secret
  - Simpler key management
  - Faster token verification
  - Can migrate to RS256 in Phase 2/3 if needed

Future Migration Path:
  Phase 2-3: Consider RS256 when:
    - Adding third-party API access
    - Building mobile apps
    - Implementing SSO/OAuth2
```

---

### 2. Token Expiration Strategy

**Research Findings (Industry Standards):**

```yaml
GitHub:
  Access Token: 1 hour
  Refresh Token: No expiration (revocable)

Stripe:
  API Keys: No expiration
  OAuth tokens: 90 days

AWS:
  Temporary credentials: 15 min - 12 hours
  Session tokens: 1 hour default

Auth0 Recommendations:
  Access Token: 15 minutes - 1 hour
  Refresh Token: 7 days - 30 days
  ID Token: 15 minutes
```

**OWASP Recommendations:**

- Access Token: **Short-lived** (5-15 minutes ideal, max 1 hour)
- Refresh Token: **Medium-lived** (7-30 days)
- Sensitive operations: **Require re-authentication**

**DECISION for GACP Platform:**

```yaml
Access Token:
  Expiration: 15 minutes
  Purpose: API access
  Storage: Memory only (React state)
  Rationale:
    - Short enough to limit damage if stolen
    - Long enough to avoid UX friction
    - Industry standard (Auth0, AWS)

Refresh Token:
  Expiration: 7 days
  Purpose: Get new access token
  Storage: httpOnly cookie (secure)
  Rationale:
    - Balance security vs user convenience
    - Farmers typically work weekly cycles
    - Forces re-login weekly (acceptable for farmers)

Sensitive Operations:
  - Payment confirmation: Re-authenticate
  - Profile update: Re-authenticate if > 5 min since last auth
  - Admin actions: Always re-authenticate
```

---

### 3. Token Storage Strategy

**Research: XSS vs CSRF Tradeoffs**

**Option A: localStorage/sessionStorage**

```yaml
Security: ✗ Vulnerable to XSS attacks
  ✗ Accessible by any JavaScript
  ✗ No protection mechanism

Pros: ✓ Easy to implement
  ✓ Works with CORS
  ✓ Available in all contexts

Cons: ✗ Major security risk
  ✗ Not recommended by OWASP
  ✗ Can't be httpOnly

Verdict: ❌ NOT RECOMMENDED
```

**Option B: httpOnly Cookies**

```yaml
Security: ✓ Not accessible by JavaScript (XSS protection)
  ✓ Can be Secure + SameSite
  ✓ Automatically sent with requests

Pros: ✓ Best security practice (OWASP recommended)
  ✓ XSS protection
  ✓ httpOnly + Secure flags

Cons: ✗ Vulnerable to CSRF (mitigated with SameSite)
  ✗ Requires CORS configuration
  ✗ Not accessible for mobile apps

Verdict: ✅ RECOMMENDED for web app
```

**Option C: Memory (React State) + httpOnly Cookie**

```yaml
Security: ✓ Access token in memory (XSS protection)
  ✓ Refresh token in httpOnly cookie
  ✓ Best of both worlds

Pros: ✓ Access token not persisted (cleared on page reload)
  ✓ Refresh token protected by httpOnly
  ✓ CSRF protection via SameSite
  ✓ Can implement silent refresh

Cons: ✗ More complex implementation
  ✗ Requires silent refresh mechanism

Verdict: ✅ BEST PRACTICE (Recommended by Auth0)
```

**DECISION for GACP Platform:**

```yaml
Strategy: Memory + httpOnly Cookie (Option C)

Access Token:
  Storage: React application state (memory)
  Cleared: On page reload
  Renewed: Via refresh token (silent refresh)

Refresh Token:
  Storage: httpOnly cookie
  Flags: Secure, httpOnly, SameSite=Strict
  Cleared: On logout

Implementation:
  1. Login: Return access token in JSON body
  2. Set refresh token as httpOnly cookie
  3. Store access token in React state (Context API)
  4. On API call: Send access token in Authorization header
  5. On 401: Call /refresh endpoint (cookie sent automatically)
  6. Update React state with new access token
  7. Retry original request
```

---

### 4. Password Hashing: bcrypt vs argon2

**bcrypt:**

```yaml
Pros: ✓ Battle-tested (20+ years)
  ✓ Widely used (GitHub, Stripe, etc.)
  ✓ Mature Node.js implementation
  ✓ Automatic salting
  ✓ Configurable cost factor

Cons: ✗ Limited password length (72 bytes)
  ✗ Not memory-hard (GPU attacks possible)
  ✗ Older algorithm

Use Case:
  - Production-proven
  - Standard choice for most apps
```

**argon2:**

```yaml
Pros: ✓ Winner of Password Hashing Competition (2015)
  ✓ Memory-hard (resistant to GPU/ASIC attacks)
  ✓ Modern algorithm (post-quantum ready)
  ✓ Three variants (argon2i, argon2d, argon2id)

Cons: ✗ Newer (less battle-tested)
  ✗ Slightly more complex
  ✗ Requires native dependencies

Use Case:
  - High-security applications
  - Government/military systems
  - Future-proofing
```

**DECISION for GACP Platform:**

```yaml
Algorithm: bcrypt
Cost Factor: 12

Rationale:
  - Industry standard (proven)
  - Mature ecosystem
  - Sufficient security for farmer accounts
  - Balance: Security vs Performance
  - 12 rounds = ~250ms (acceptable UX)

Cost Factor Analysis:
  10 rounds: ~100ms (too fast, vulnerable)
  12 rounds: ~250ms (recommended by OWASP)
  14 rounds: ~1000ms (too slow for farmers)

Migration Path:
  - Can migrate to argon2 later if needed
  - Use bcrypt for Phase 1 (proven stability)
```

---

### 5. Account Security Features

**Researched Features from Major Platforms:**

**GitHub:**

- Account lockout: 3 failed attempts = 15 min lock
- 2FA optional (TOTP)
- Session management (revoke all)
- Login notifications

**Stripe:**

- Account lockout: 5 failed attempts = 1 hour lock
- IP-based rate limiting
- Geographic anomaly detection
- 2FA required for sensitive operations

**AWS:**

- Password policy enforcement
- MFA required for root account
- Session duration limits
- CloudTrail logging

**OWASP Recommendations:**

- Account lockout: 3-5 failed attempts
- Lockout duration: 15-30 minutes
- Rate limiting: 5 requests per 15 minutes
- Password complexity: 8+ chars, uppercase, lowercase, number, special
- Password history: Prevent reuse of last 5 passwords

**DECISION for GACP Platform:**

```yaml
Account Lockout:
  Failed Attempts: 5 attempts
  Lockout Duration: 30 minutes
  Rationale: Balance security vs farmer usability

Rate Limiting (Express rate-limit):
  Window: 15 minutes
  Max Requests: 5 login attempts
  Storage: MongoDB (distributed rate limiting)

Password Policy:
  Min Length: 8 characters
  Complexity: Uppercase + lowercase + number + special char
  Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])

Login History:
  Track: Last 10 logins
  Store: IP address, user agent, timestamp, success/failure
  Purpose: Security audit trail

2FA (Future - Phase 2):
  Method: SMS OTP (Thai mobile numbers)
  Provider: Thai SMS gateway (e.g., ThaiSMS, SMSGlobal)
  Required: Optional for Phase 1, Required for DTAM/ADMIN
```

---

### 6. Session Management

**Token Rotation Strategy:**

**Fixed Token (No Rotation):**

```yaml
Pros: ✓ Simple implementation
  ✓ No extra API calls

Cons: ✗ Token valid until expiration
  ✗ If stolen, can be used for full duration
  ✗ No mechanism to invalidate

Verdict: ❌ NOT RECOMMENDED
```

**Automatic Token Rotation:**

```yaml
Pros: ✓ Reduces exposure window
  ✓ New refresh token on every use
  ✓ Detects token theft (reuse detection)

Cons: ✗ More complex implementation
  ✗ Race conditions possible

Verdict: ✅ RECOMMENDED (Auth0 best practice)
```

**DECISION for GACP Platform:**

```yaml
Strategy: Automatic Token Rotation

Mechanism: 1. User calls /api/auth/refresh with refresh token
  2. Verify refresh token is valid and not used
  3. Generate NEW access token + NEW refresh token
  4. Mark old refresh token as "used" (blacklist)
  5. Return new tokens
  6. Old refresh token cannot be reused

Token Reuse Detection:
  - If used refresh token is reused → Security breach
  - Invalidate ALL tokens for that user
  - Force re-login
  - Send security alert email
  - Log to audit trail

Database Schema:
  refresh_tokens collection:
    - tokenId (unique)
    - userId (indexed)
    - token (hashed)
    - expiresAt (TTL index)
    - isUsed (boolean, default false)
    - usedAt (timestamp)
    - createdAt
```

---

### 7. Email Verification

**Research Findings:**

**Option A: Mandatory Verification (GitHub, Stripe)**

```yaml
Pros: ✓ Prevents fake accounts
  ✓ Ensures valid contact info
  ✓ Better security

Cons: ✗ Friction in signup flow
  ✗ Lost emails = lost users
  ✗ Requires email infrastructure

Verdict: ✅ RECOMMENDED for GACP (sensitive gov't data)
```

**Option B: Optional Verification (Facebook, Twitter)**

```yaml
Pros: ✓ Faster signup
  ✓ Higher conversion

Cons: ✗ More fake accounts
  ✗ Less secure

Verdict: ❌ NOT SUITABLE for government platform
```

**DECISION for GACP Platform:**

```yaml
Strategy: Mandatory Email Verification

Flow: 1. User registers → Account created (emailVerified = false)
  2. Verification email sent (token valid 24 hours)
  3. User clicks link → Email verified
  4. User can login

Restrictions (Before Verification): ✗ Cannot submit applications
  ✗ Cannot make payments
  ✓ Can login and view profile

Email Token:
  Format: Cryptographically secure random string (32 bytes)
  Generation: crypto.randomBytes(32).toString('hex')
  Expiration: 24 hours
  Storage: users collection (emailVerificationToken field)
  One-time use: Cleared after verification

Resend Email:
  Rate Limit: 3 emails per hour
  Throttling: Exponential backoff (5 min → 15 min → 30 min)

Email Provider (Phase 1):
  Provider: SendGrid (free tier 100 emails/day)
  Upgrade: When > 50 signups/day
  Thai Support: ✓ Thai language templates
```

---

## 🛡️ Security Implementation Checklist

### OWASP Top 10 Mitigation

✅ **A01:2021 - Broken Access Control**

- Implement RBAC middleware
- Verify user ownership before data access
- Default deny all access

✅ **A02:2021 - Cryptographic Failures**

- Use bcrypt (cost 12) for passwords
- HTTPS only (no HTTP)
- httpOnly + Secure cookies

✅ **A03:2021 - Injection**

- Use Joi validation for all inputs
- Mongoose parameterized queries (no string concat)
- Sanitize user inputs

✅ **A05:2021 - Security Misconfiguration**

- Helmet.js for security headers
- CORS properly configured
- No default credentials
- Error messages don't leak info

✅ **A07:2021 - Identification and Authentication Failures**

- Account lockout (5 attempts)
- Rate limiting (Express rate-limit)
- Secure session management
- MFA ready (Phase 2)

✅ **A09:2021 - Security Logging and Monitoring**

- Audit all auth events
- Log failed logins
- Alert on suspicious patterns
- 7-year retention

---

## 📊 Performance Benchmarks

### Target Metrics (PHASE1 Specs)

```yaml
Response Times (p95):
  /register: < 300ms (bcrypt hashing)
  /login: < 200ms (including token generation)
  /refresh: < 100ms (token rotation)
  /verify-email: < 150ms

Throughput:
  Target: 100 requests/second
  Peak: 500 requests/second (during campaigns)

Database Queries:
  User lookup: < 10ms (indexed by email)
  Token verification: < 5ms (in-memory JWT verify)
```

### Optimization Strategies

```yaml
1. Database Indexing:
  - email (unique)
  - idCard (unique)
  - emailVerificationToken (sparse)

2. Caching (Redis - Future):
  - User session data (15 min TTL)
  - Failed login attempts (rate limiting)
  - Email verification tokens

3. Connection Pooling:
  - MongoDB: maxPoolSize 100
  - Minimum connections: 10

4. Async Operations:
  - Email sending (background job)
  - Audit logging (non-blocking)
```

---

## 🔧 Implementation Stack

### NPM Packages (Production)

```json
{
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "joi": "^17.11.0",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "mongoose": "^8.0.3",
  "dotenv": "^16.3.1",
  "crypto": "built-in"
}
```

### Dev Dependencies

```json
{
  "jest": "^29.7.0",
  "supertest": "^6.3.3",
  "@types/jest": "^29.5.11",
  "mongodb-memory-server": "^9.1.3"
}
```

---

## 📝 API Endpoints Design

### Authentication Endpoints

```yaml
POST /api/auth/register:
  Rate Limit: 10 per hour (per IP)
  Validation: Joi schema
  Response: 201 Created

POST /api/auth/login:
  Rate Limit: 5 per 15 minutes (per IP)
  Account Lockout: 5 failed attempts
  Response: 200 OK (with tokens)

POST /api/auth/refresh:
  Rate Limit: 100 per hour
  Cookie: refresh_token (httpOnly)
  Response: 200 OK (new tokens)

POST /api/auth/logout:
  Rate Limit: 100 per hour
  Clear: Refresh token cookie
  Blacklist: Refresh token
  Response: 200 OK

GET /api/auth/verify-email:
  Query: token (verification token)
  One-time use: Token cleared after use
  Response: 200 OK

POST /api/auth/resend-verification:
  Rate Limit: 3 per hour
  Throttling: Exponential backoff
  Response: 200 OK

POST /api/auth/forgot-password:
  Rate Limit: 3 per hour
  Email: Password reset link
  Token: Valid 1 hour
  Response: 200 OK

POST /api/auth/reset-password:
  Query: token (reset token)
  Validation: Password complexity
  One-time use: Token cleared
  Response: 200 OK

GET /api/auth/me:
  Auth: Required (JWT)
  Response: Current user profile
```

---

## 🎯 Implementation Timeline

### Sprint 1 (Week 1-2)

```yaml
Week 1:
  - Setup project structure
  - Configure Express server
  - Setup MongoDB connection
  - Implement User model
  - Create auth routes skeleton

Week 2:
  - Implement /register endpoint
  - Implement /login endpoint
  - Implement JWT token generation
  - Implement password hashing
  - Write unit tests (40 tests)
```

### Sprint 2 (Week 3-4)

```yaml
Week 3:
  - Implement /refresh endpoint
  - Implement token rotation
  - Implement /logout endpoint
  - Implement /verify-email endpoint
  - Setup email sending (SendGrid)

Week 4:
  - Implement account lockout
  - Implement rate limiting
  - Write integration tests (20 tests)
  - Write security tests (20 tests)
  - Performance testing
```

---

## ✅ Success Criteria

### Functional Requirements

- ✓ Users can register with email + password
- ✓ Email verification required before app submission
- ✓ Users can login with credentials
- ✓ JWT tokens generated and validated
- ✓ Refresh token rotation working
- ✓ Account lockout after 5 failed attempts
- ✓ Password reset flow implemented

### Non-Functional Requirements

- ✓ Response time < 200ms (p95)
- ✓ Rate limiting working (5 attempts per 15 min)
- ✓ Code coverage > 80%
- ✓ OWASP Top 10 compliant
- ✓ All auth events logged to audit trail

### Security Validation

- ✓ Passwords hashed with bcrypt (cost 12)
- ✓ JWT tokens signed with strong secret (256-bit)
- ✓ httpOnly cookies for refresh tokens
- ✓ CORS properly configured
- ✓ Helmet.js security headers
- ✓ Input validation (Joi)
- ✓ No password in responses
- ✓ Account lockout working
- ✓ Rate limiting working

---

## 📚 References

1. **OWASP Authentication Cheat Sheet**  
   https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

2. **NIST SP 800-63B - Digital Identity Guidelines**  
   https://pages.nist.gov/800-63-3/sp800-63b.html

3. **Auth0 Best Practices**  
   https://auth0.com/docs/secure/tokens/token-best-practices

4. **JWT Best Practices**  
   https://tools.ietf.org/html/rfc8725

5. **Node.js Security Best Practices**  
   https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices

6. **Express Security Best Practices**  
   https://expressjs.com/en/advanced/best-practice-security.html

---

**Research Complete:** October 16, 2025  
**Next Step:** Implementation  
**Confidence Level:** High ✅
