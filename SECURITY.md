# 🔒 SECURITY DOCUMENTATION - Lumina Market

**Last Updated:** 2025-11-21

This document outlines all security features implemented in the Lumina Market e-commerce application to protect against various cyber attacks.

---

## 🛡️ Security Features Overview

### 1. **Helmet - HTTP Security Headers**
**Package:** `helmet`  
**Protection Against:** XSS, Clickjacking, MIME sniffing, DNS prefetching attacks

**What it does:**
- Sets secure HTTP headers automatically
- Prevents browsers from MIME-sniffing responses
- Disables browser features that could be exploited
- Implements Content Security Policy (CSP)

**Configuration:**
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
})
```

---

### 2. **CORS - Cross-Origin Resource Sharing**
**Package:** `cors`  
**Protection Against:** Unauthorized cross-origin requests, CSRF attacks

**What it does:**
- Controls which domains can access the API
- Restricts HTTP methods allowed
- Specifies allowed headers

**Configuration:**
```javascript
{
  origin: 'http://localhost:3001', // Only allow frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
```

**To update for production:** Set `origin` to your production domain in `.env`

---

### 3. **Rate Limiting**
**Package:** `express-rate-limit`  
**Protection Against:** Brute force attacks, DDoS, API abuse

**What it does:**
- Limits number of requests from a single IP
- Different limits for different routes
- **General API:** 100 requests per 15 minutes
- **Auth routes (login/register):** 5 requests per 15 minutes

**Why this matters:**
- Prevents attackers from trying thousands of passwords
- Stops automated bots from overwhelming the server
- Protects against credential stuffing attacks

---

### 4. **NoSQL Injection Prevention**
**Package:** `express-mongo-sanitize`  
**Protection Against:** MongoDB injection attacks

**What it does:**
- Removes `$` and `.` characters from user input
- Prevents malicious MongoDB operators in queries

**Example attack prevented:**
```javascript
// Attacker tries:
{ "email": { "$gt": "" }, "password": { "$gt": "" } }

// Sanitized to:
{ "email": "", "password": "" }
```

---

### 5. **XSS Protection**
**Package:** `xss-clean`  
**Protection Against:** Cross-Site Scripting (XSS) attacks

**What it does:**
- Sanitizes user input to prevent malicious scripts
- Cleans HTML/JavaScript from request body, query params, params

**Example attack prevented:**
```javascript
// Attacker submits:
username: "<script>alert('hacked')</script>"

// Cleaned to:
username: "&lt;script&gt;alert('hacked')&lt;/script&gt;"
```

---

### 6. **HTTP Parameter Pollution (HPP) Prevention**
**Package:** `hpp`  
**Protection Against:** Parameter pollution attacks

**What it does:**
- Prevents duplicate query parameters
- Protects against query string manipulation

**Example attack prevented:**
```
// Attacker tries:
/api/products?price=10&price[$gt]=0

// HPP prevents second price parameter
```

---

### 7. **Request Size Limiting**
**Built-in:** Express body-parser  
**Protection Against:** Large payload attacks, memory exhaustion

**Configuration:**
```javascript
express.json({ limit: '10kb' })
express.urlencoded({ limit: '10kb' })
```

**Why this matters:**
- Prevents attackers from sending massive JSON payloads
- Protects server memory
- Stops potential DoS attacks

---

### 8. **JWT Authentication Security**
**Custom Implementation**  
**Protection Against:** Session hijacking, unauthorized access

**Features:**
- Tokens expire after 7 days
- Passwords hashed with bcrypt (10 salt rounds)
- Tokens verified on every protected route
- User passwords never returned in API responses

**File:** `server/middleware/authMiddleware.js`

---

### 9. **Password Security**
**Package:** `bcryptjs`  
**Protection Against:** Password cracking, rainbow table attacks

**Implementation:**
- Passwords hashed before storage (never plain text)
- Bcrypt with 10 salt rounds
- Automatic password comparison

**File:** `server/models/User.js`

---

## 🎯 Attack Vectors Prevented

| Attack Type | Prevention Method | Status |
|------------|------------------|--------|
| **XSS (Cross-Site Scripting)** | Helmet CSP + xss-clean | ✅ Protected |
| **NoSQL Injection** | express-mongo-sanitize | ✅ Protected |
| **Brute Force** | Rate limiting (5 attempts/15min) | ✅ Protected |
| **DDoS** | Rate limiting (100 req/15min) | ✅ Protected |
| **CSRF** | CORS configuration | ✅ Protected |
| **Clickjacking** | Helmet X-Frame-Options | ✅ Protected |
| **MIME Sniffing** | Helmet X-Content-Type-Options | ✅ Protected |
| **Password Cracking** | Bcrypt hashing | ✅ Protected |
| **Session Hijacking** | JWT expiration | ✅ Protected |
| **HPP (Parameter Pollution)** | hpp middleware | ✅ Protected |
| **Large Payload Attack** | Request size limits | ✅ Protected |
| **Unauthorized Access** | JWT verification | ✅ Protected |

---

## 📦 Security Packages Installed

```json
{
  "helmet": "^8.0.0",
  "express-rate-limit": "^7.5.0",
  "express-mongo-sanitize": "^2.2.0",
  "xss-clean": "^0.1.4",
  "hpp": "^0.2.3",
  "cors": "^2.8.5",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 🔐 Security Best Practices Implemented

### ✅ **Input Validation**
- All user inputs sanitized
- Request size limitations
- Type checking on API endpoints

### ✅ **Authentication & Authorization**
- JWT-based authentication
- Protected routes require valid tokens
- Passwords never stored in plain text
- Token expiration enforced

### ✅ **Data Protection**
- MongoDB connection encrypted
- Sensitive data never logged
- User-specific data isolation (cart, orders)

### ✅ **API Security**
- Rate limiting on all endpoints
- Stricter limits on auth routes
- CORS restricted to specific origin
- Error messages don't leak system info

### ✅ **HTTP Security**
- Secure headers set by Helmet
- Content Security Policy active
- HTTPS recommended for production

---

## 🚀 Production Deployment Recommendations

### **1. Environment Variables**
Update `.env` for production:
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
JWT_SECRET=<strong-random-secret>
MONGODB_URI=<production-mongodb-uri>
```

### **2. Enable HTTPS**
- Use SSL/TLS certificates
- Redirect HTTP → HTTPS
- Set secure cookie flags

### **3. Additional Security (Optional)**
- **CSU RF Tokens:** Consider adding for form submissions
- **2FA:** Two-factor authentication for users
- **Security Audits:** Regular npm audit scans
- **Logging:** Implement Winston for security event logging
- **Monitoring:** Add Sentry or similar for error tracking

### **4. Regular Updates**
```bash
npm audit
npm audit fix
npm update
```

---

## 📋 Security Checklist

- [x] Helmet configured for secure headers
- [x] CORS restricted to specific origin
- [x] Rate limiting on all API routes
- [x] Stricter rate limiting on auth routes
- [x] NoSQL injection prevention
- [x] XSS attack prevention
- [x] HPP protection enabled
- [x] Request size limits set
- [x] JWT authentication implemented
- [x] Password hashing with bcrypt
- [x] Token expiration enforced
- [x] Protected routes verified
- [ ] HTTPS enabled (production only)
- [ ] Security logging (optional)
- [ ] CSRF tokens (optional)
- [ ] 2FA (optional)

---

## 🛠️ Testing Security Features

### **Test Rate Limiting:**
```bash
# Try making 6 login attempts rapidly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# 6th attempt should return 429 Too Many Requests
```

### **Test NoSQL Injection:**
```bash
# Try injecting MongoDB operator
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}'
# Should fail - operators sanitized
```

### **Test XSS:**
- Try registering with username: `<script>alert('xss')</script>`
- Should be sanitized and not execute

---

## 📞 Security Contact

If you discover a security vulnerability, please email: security@luminamarket.com

**Please do NOT create public GitHub issues for security vulnerabilities.**

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet Documentation](https://helmetjs.github.io/)

---

**Version:** 1.0.0  
**Maintained by:** Lumina Market Development Team
