# Security Testing Guide for Web Applications

A comprehensive guide for implementing security testing in web applications, using the Todo application as a practical example.

## Table of Contents

1. [Security Testing Fundamentals](#security-testing-fundamentals)
2. [Manual Security Testing](#manual-security-testing)
3. [Automated Security Testing](#automated-security-testing)
4. [Best Practices](#best-practices)
5. [Hands-On Exercises](#hands-on-exercises)
6. [Tools and Resources](#tools-and-resources)

---

## Security Testing Fundamentals

### What is Security Testing?

Security testing is a type of software testing that identifies vulnerabilities, threats, and risks in software applications. It ensures that the software protects data and maintains functionality as intended.

### Why Security Testing Matters

- **Data Protection**: Prevents unauthorized access to sensitive information
- **Compliance**: Meets regulatory requirements (GDPR, HIPAA, PCI-DSS)
- **Reputation**: Protects against security breaches that damage trust
- **Financial**: Prevents costly security incidents and downtime
- **User Safety**: Protects users from malicious attacks

### Types of Security Testing

#### 1. Static Application Security Testing (SAST)
- **What**: Analyzes source code without executing it
- **When**: During development phase
- **Tools**: SonarQube, Snyk Code, Semgrep
- **Pros**: Early detection, comprehensive coverage
- **Cons**: May produce false positives

#### 2. Dynamic Application Security Testing (DAST)
- **What**: Tests running applications from the outside
- **When**: After deployment to test environment
- **Tools**: OWASP ZAP, Burp Suite, Acunetix
- **Pros**: Real-world testing, no false positives
- **Cons**: Limited code coverage, requires running app

#### 3. Interactive Application Security Testing (IAST)
- **What**: Combines SAST and DAST approaches
- **When**: During testing phase
- **Tools**: Veracode, Contrast Security
- **Pros**: Low false positives, real-time feedback
- **Cons**: Performance overhead, complex setup

#### 4. Software Composition Analysis (SCA)
- **What**: Scans dependencies for known vulnerabilities
- **When**: Continuously during development
- **Tools**: Snyk, npm audit, OWASP Dependency Check
- **Pros**: Quick wins, automated
- **Cons**: Only covers known vulnerabilities

### OWASP Top 10 Vulnerabilities (2021)

1. **A01: Broken Access Control**
   - Users can act outside of their intended permissions
   - Example: User A accessing User B's todo items

2. **A02: Cryptographic Failures**
   - Sensitive data transmitted or stored without proper encryption
   - Example: Passwords stored in plain text

3. **A03: Injection**
   - Untrusted data sent to an interpreter as part of a command
   - Example: SQL injection, NoSQL injection

4. **A04: Insecure Design**
   - Missing or ineffective control design
   - Example: No rate limiting on password reset

5. **A05: Security Misconfiguration**
   - Insecure default configurations or incomplete setups
   - Example: Default admin credentials, verbose error messages

6. **A06: Vulnerable and Outdated Components**
   - Using components with known vulnerabilities
   - Example: Outdated npm packages with security flaws

7. **A07: Identification and Authentication Failures**
   - Compromised functions related to user's identity
   - Example: Weak passwords, session management flaws

8. **A08: Software and Data Integrity Failures**
   - Code and infrastructure that doesn't protect against integrity violations
   - Example: Using CDNs without integrity checks

9. **A09: Security Logging and Monitoring Failures**
   - Insufficient logging and monitoring
   - Example: No audit trails, delayed breach detection

10. **A10: Server-Side Request Forgery (SSRF)**
    - Application fetching remote resources without validating URL
    - Example: App making requests to internal services

### Security Testing Strategy: Continuous vs Periodic

Understanding **when** and **how often** to run different types of security tests is crucial for an effective security program. Not all security tests should run with every commit.

#### Continuous Security Tests (Run with Every Build)

These tests should be part of your regular unit/integration test suite and run automatically:

##### Functional Security Tests:
```javascript
// Run with npm test - these test your CODE
describe('Security Functions', () => {
  it('should sanitize XSS inputs', () => {
    // Tests that DOMPurify middleware works
  });

  it('should prevent SQL injection', () => {
    // Tests that Prisma/validation prevents SQL injection
  });

  it('should validate JWT tokens', () => {
    // Tests that auth middleware works correctly
  });
});
```

**Why Continuous:**
- **Code changes** might accidentally remove security middleware
- **Dependency updates** might break security functions
- **Refactoring** might bypass input validation
- **Fast execution** (< 1 second per test)
- **Deterministic results** (same input = same output)
- **Prevent security regressions** before they reach production

##### Examples from Our Todo App:
```javascript
// backend/tests/security.test.ts - Runs with npm test
- XSS sanitization tests
- SQL injection prevention tests
- JWT validation tests
- Input validation security tests
- CSRF protection tests
```

#### Periodic Security Tests (Run Manually or Scheduled)

These tests are more comprehensive but slower, and often test **infrastructure** rather than code:

##### Infrastructure Security Tests:
```bash
# Run weekly/monthly - these test your DEPLOYMENT
npm audit                    # Dependency vulnerabilities
docker run owasp/zap         # DAST scanning
nmap localhost               # Port scanning
testssl.sh domain.com        # TLS configuration
```

**Why Periodic:**
- **Slow execution** (minutes to hours)
- **Environment dependent** (requires running application)
- **External dependencies** (network, third-party tools)
- **Infrastructure focus** (deployment, configuration)
- **Comprehensive coverage** (full application attack surface)

##### Frequency Guidelines:
- **Daily**: Dependency scans (`npm audit`)
- **Weekly**: DAST scans (OWASP ZAP)
- **Monthly**: Full penetration testing
- **Quarterly**: External security audits
- **On deployment**: SSL/TLS configuration checks

#### Security Testing Pyramid

```
                    /\
                   /  \
              Manual/  \ Pen Testing
             /    \    \ (Quarterly)
        DAST /      \
           /  SAST   \  (Weekly/Monthly)
          /          \
    Unit Tests        Integration Tests
   (Continuous)       (Continuous)
    ─────────────────────────────────
```

##### Layer Breakdown:

**Bottom Layer - Unit/Integration Tests (Continuous)**
```javascript
// Fast, focused, run every commit
it('should prevent XSS in user input', () => {
  const sanitized = sanitizeInput('<script>alert("xss")</script>');
  expect(sanitized).not.toContain('<script>');
});
```

**Middle Layer - SAST/DAST (Periodic)**
```bash
# Automated but slower, run weekly
npm audit                    # Static analysis
owasp-zap-baseline.py       # Dynamic analysis
snyk test                   # Dependency analysis
```

**Top Layer - Manual Testing (Scheduled)**
```bash
# Human expertise, run monthly/quarterly
- Penetration testing
- Code reviews
- Architecture reviews
- Threat modeling sessions
```

#### Practical CI/CD Pipeline Example

##### .github/workflows/security.yml:
```yaml
name: Security Pipeline

on: [push, pull_request]

jobs:
  # Continuous - Every commit
  unit-security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run security unit tests
        run: npm test -- --testNamePattern="Security"

  # Continuous - Every commit
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run npm audit
        run: npm audit --audit-level=moderate

  # Periodic - Only on main branch
  dast-scan:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Start application
        run: npm start &
      - name: Run OWASP ZAP scan
        run: docker run owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

  # Scheduled - Weekly
  full-security-scan:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    steps:
      - name: Comprehensive security scan
        run: |
          npm audit
          docker run owasp/zap2docker-stable zap-full-scan.py -t http://localhost:3000
```

#### What Goes Where: Decision Matrix

| Test Type | Example | Frequency | Runs In |
|-----------|---------|-----------|---------|
| **Input Validation** | XSS sanitization | Every commit | `npm test` |
| **Authentication Logic** | JWT validation | Every commit | `npm test` |
| **Authorization Logic** | RBAC tests | Every commit | `npm test` |
| **Dependency Scan** | `npm audit` | Every commit | CI/CD |
| **DAST Baseline** | OWASP ZAP basic | Weekly | CI/CD scheduled |
| **DAST Full** | OWASP ZAP complete | Monthly | Manual/scheduled |
| **Penetration Test** | External audit | Quarterly | Manual |
| **SSL/TLS Config** | Certificate check | On deployment | Manual |

#### Common Anti-Patterns to Avoid

##### [WRONG]: Running Slow Tests Continuously
```yaml
# This will make developers avoid running tests
jobs:
  every-commit:
    steps:
      - name: Full pen test on every commit  # [WRONG] Too slow
        run: full-security-audit.sh
```

##### [WRONG]: Only Manual Security Testing
```javascript
// No automated security tests
// Security bugs slip through until manual audit
```

##### [RIGHT]: Balanced Approach
```yaml
# Fast feedback loop + comprehensive coverage
jobs:
  fast-security:
    steps:
      - name: Security unit tests      # 30 seconds
      - name: Dependency check        # 1 minute

  comprehensive-security:
    if: scheduled
    steps:
      - name: Full DAST scan          # 30 minutes, but not blocking
```

#### Team Responsibilities

##### Developers:
- Write security unit tests for new features
- Fix issues found in continuous tests immediately
- Review periodic test results weekly

##### DevOps/Security Team:
- Configure and maintain DAST tools
- Schedule and monitor periodic scans
- Coordinate penetration testing
- Set security policies and thresholds

##### Product/Management:
- Budget for security tools and audits
- Prioritize security issues appropriately
- Approve scheduled security maintenance windows

#### Measuring Security Testing Effectiveness

##### Metrics to Track:
```javascript
// Continuous metrics (automated)
- Security test coverage percentage
- Time to fix security issues (MTTR)
- Number of security issues caught in development vs production

// Periodic metrics (manual)
- Vulnerabilities found in pen tests
- Time between security audits
- Security debt accumulation
```

##### Success Indicators:
- **High confidence in deployments** - because continuous tests catch regressions
- **Fewer security issues in production** - because comprehensive testing catches edge cases
- **Faster incident response** - because teams understand the security posture
- **Better security culture** - because security is integrated into daily workflow

---

## Manual Security Testing

### Authentication Testing

#### Test Cases:
1. **Password Strength**
   ```bash
   # Test weak passwords
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123","name":"Test"}'
   ```

2. **Account Lockout**
   ```bash
   # Test multiple failed login attempts
   for i in {1..10}; do
     curl -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"wrong"}'
   done
   ```

3. **Session Management**
   ```bash
   # Test session timeout
   # Login and wait for token expiration
   TOKEN="your_jwt_token"
   curl -X GET http://localhost:3000/api/todos \
     -H "Authorization: Bearer $TOKEN"
   ```

### Authorization Testing (IDOR)

#### Test Cases:
1. **Direct Object Reference**
   ```bash
   # User A tries to access User B's todo
   curl -X GET http://localhost:3000/api/todos/USER_B_TODO_ID \
     -H "Authorization: Bearer USER_A_TOKEN"
   ```

2. **Privilege Escalation**
   ```bash
   # Regular user tries admin endpoint
   curl -X GET http://localhost:3000/api/admin/users \
     -H "Authorization: Bearer REGULAR_USER_TOKEN"
   ```

### Input Validation Testing

#### XSS Testing:
```bash
# Stored XSS in todo title
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(\"XSS\")</script>","description":"test"}'

# Reflected XSS in search parameter
curl "http://localhost:3000/api/search?q=<script>alert('XSS')</script>"
```

#### SQL Injection Testing:
```bash
# SQL injection in login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR '\''1'\''='\''1'\'' --","password":"any"}'

# SQL injection in todo filter
curl "http://localhost:3000/api/todos?category='; DROP TABLE todos; --"
```

### Security Headers Testing

```bash
# Check security headers
curl -I http://localhost:3000

# Should include:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000 (production only)
# Content-Security-Policy: default-src 'self'
# Note: X-XSS-Protection header is deprecated and should NOT be present in modern apps
```

### HTTPS/TLS Implementation and Testing

#### Why HTTPS Matters for Security Learning

HTTPS provides critical security benefits that every developer should understand:

- **Encryption in Transit**: Prevents eavesdropping on sensitive data (passwords, JWTs, personal info)
- **Data Integrity**: Ensures data isn't tampered with during transmission
- **Authentication**: Verifies server identity to prevent man-in-the-middle attacks
- **Browser Security Features**: Enables secure cookies, service workers, geolocation APIs
- **SEO and Trust**: Modern browsers mark HTTP sites as "Not Secure"

#### Development HTTPS Setup

##### Option 1: Self-Signed Certificates (Learning)

```bash
# Generate self-signed certificate for localhost
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.cert -days 365 -nodes -subj '/CN=localhost'

# Or use mkcert for better browser trust
# Install mkcert first: https://github.com/FiloSottile/mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

##### Option 2: mkcert (Recommended for Development)

```bash
# Install mkcert (macOS)
brew install mkcert
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1

# This creates:
# localhost+2.pem (certificate)
# localhost+2-key.pem (private key)
```

#### Implementing HTTPS in Node.js

##### Basic HTTPS Server Setup:

```javascript
// src/https-server.ts
import https from 'https';
import fs from 'fs';
import path from 'path';
import { app } from './server';

const startHttpsServer = () => {
  // Development HTTPS configuration
  if (process.env.NODE_ENV === 'development') {
    try {
      const options = {
        key: fs.readFileSync(path.join(__dirname, '../certs/localhost+2-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '../certs/localhost+2.pem'))
      };

      const httpsServer = https.createServer(options, app);
      const httpsPort = process.env.HTTPS_PORT || 5443;

      httpsServer.listen(httpsPort, () => {
        console.log(`[HTTPS] Server running on https://localhost:${httpsPort}`);
        console.log(`[HTTPS] Health check: https://localhost:${httpsPort}/health`);
      });

      return httpsServer;
    } catch (error) {
      console.warn('HTTPS certificates not found, falling back to HTTP');
      console.log('Generate certificates with: mkcert localhost 127.0.0.1 ::1');
      return null;
    }
  }
};

export { startHttpsServer };
```

##### Enhanced Server with HTTP Redirect:

```javascript
// src/secure-server.ts
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';

const createSecureServer = (app: express.Application) => {
  const httpPort = process.env.PORT || 5000;
  const httpsPort = process.env.HTTPS_PORT || 5443;

  // HTTP server that redirects to HTTPS
  const httpApp = express();
  httpApp.use((req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.redirect(301, `https://${req.get('Host')}${req.url}`);
    }
    // In development, allow HTTP for testing
    res.status(200).json({
      message: 'HTTP server running. Use HTTPS for secure connections.',
      httpsUrl: `https://localhost:${httpsPort}${req.url}`
    });
  });

  // Start HTTP server
  http.createServer(httpApp).listen(httpPort, () => {
    console.log(`[HTTP] Server running on http://localhost:${httpPort}`);
  });

  // Start HTTPS server if certificates exist
  try {
    const options = {
      key: fs.readFileSync('certs/localhost+2-key.pem'),
      cert: fs.readFileSync('certs/localhost+2.pem')
    };

    https.createServer(options, app).listen(httpsPort, () => {
      console.log(`[HTTPS] Server running on https://localhost:${httpsPort}`);
    });
  } catch (error) {
    console.warn('HTTPS certificates not found');
  }
};
```

#### HTTPS Testing

##### Certificate Validation Testing:

```bash
# Test certificate validity
openssl s_client -connect localhost:5443 -servername localhost

# Check certificate details
openssl x509 -in certs/localhost+2.pem -text -noout

# Test with curl
curl -v https://localhost:5443/health

# Test certificate expiration
openssl x509 -in certs/localhost+2.pem -noout -dates
```

##### Browser Testing Checklist:

1. **Certificate Trust**: Green padlock in address bar
2. **Mixed Content**: No HTTP resources on HTTPS pages
3. **HSTS Headers**: Strict-Transport-Security header present
4. **Secure Cookies**: Cookies marked with Secure flag
5. **TLS Version**: Using TLS 1.2 or higher

##### Automated HTTPS Testing:

```javascript
// tests/https.test.ts
import https from 'https';
import { promisify } from 'util';

describe('HTTPS Configuration', () => {
  it('should serve content over HTTPS', async () => {
    const options = {
      hostname: 'localhost',
      port: 5443,
      path: '/health',
      method: 'GET',
      rejectUnauthorized: false // For self-signed certs in testing
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        resolve(res);
      });
      req.on('error', reject);
      req.end();
    });

    expect(response.statusCode).toBe(200);
  });

  it('should include HSTS headers', async () => {
    const response = await request(httpsApp)
      .get('/health')
      .trustLocalhost(true);

    expect(response.headers['strict-transport-security']).toBeDefined();
    expect(response.headers['strict-transport-security']).toContain('max-age=');
  });

  it('should set secure cookie flags', async () => {
    const response = await request(httpsApp)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .trustLocalhost(true);

    const cookies = response.headers['set-cookie'];
    if (cookies) {
      expect(cookies.some(cookie => cookie.includes('Secure'))).toBe(true);
    }
  });
});
```

#### Production HTTPS Strategies

##### 1. Cloud Platform SSL (Recommended for Beginners)

```javascript
// Most platforms handle this automatically
// Heroku, Vercel, Netlify, Railway provide HTTPS out of the box

// Your app just needs to trust forwarded headers
app.set('trust proxy', 1);

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }
    next();
  });
}
```

##### 2. Reverse Proxy (Nginx/Caddy)

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;

    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

##### 3. Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

#### Common HTTPS Issues and Solutions

##### Mixed Content Errors:

```javascript
// Problem: HTTP resources on HTTPS pages
<script src="http://example.com/script.js"></script> // [WRONG]

// Solution: Use HTTPS or protocol-relative URLs
<script src="https://example.com/script.js"></script> // [RIGHT]
<script src="//example.com/script.js"></script> // [RIGHT] (inherits protocol)
```

##### Certificate Trust Issues:

```javascript
// Development workaround for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // [DANGER] Never in production!

// Better: Use proper development certificates with mkcert
// Or configure your test environment to trust the CA
```

##### HSTS Preload Issues:

```javascript
// Modern Helmet configuration - disable deprecated features
app.use(helmet({
  // Disable deprecated X-XSS-Protection header
  xssFilter: false,

  // Be careful with HSTS preload in development
  hsts: {
    maxAge: process.env.NODE_ENV === 'production' ? 31536000 : 0,
    includeSubDomains: true,
    preload: process.env.NODE_ENV === 'production'
  },

  // CSP provides better XSS protection than the deprecated header
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

#### HTTPS Performance Considerations

##### HTTP/2 Benefits:

```javascript
// HTTP/2 is automatically enabled with HTTPS in modern Node.js
const http2 = require('http2');

// Create HTTP/2 secure server
const server = http2.createSecureServer({
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);
```

##### TLS Termination:

```javascript
// For high-traffic applications, terminate TLS at load balancer
// Keep internal communication on HTTP for performance
// Ensure secure internal network
```

#### HTTPS Learning Exercise

##### Exercise: Implement Full HTTPS Stack

1. **Generate Development Certificates**:
```bash
mkdir certs
cd certs
mkcert localhost 127.0.0.1 ::1
```

2. **Update Server Configuration**:
```javascript
// Add HTTPS support to your existing server
// Implement HTTP to HTTPS redirect
// Add HSTS headers
// Test with self-signed certificates
```

3. **Update Security Middleware**:
```javascript
// Ensure secure cookies in HTTPS
app.use(session({
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

4. **Test HTTPS Implementation**:
```bash
# Test HTTPS endpoint
curl -k https://localhost:5443/health

# Test HTTP redirect
curl -I http://localhost:5000/health

# Test security headers
curl -k -I https://localhost:5443/health | grep -i security
```

5. **Write HTTPS Tests**:
```javascript
// Add tests for HTTPS functionality
// Test certificate validation
// Test security headers
// Test secure cookies
```

---

## Automated Security Testing

### Setting Up npm audit

```bash
# Basic vulnerability scan
npm audit

# Fix automatically fixable issues
npm audit fix

# Force fixes (use with caution)
npm audit fix --force

# Generate audit report
npm audit --json > audit-report.json
```

### Integrating Snyk

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor

# Test Docker images
snyk test --docker your-image-name
```

### ESLint Security Plugin

```bash
# Install security plugin
npm install --save-dev eslint-plugin-security

# Add to .eslintrc.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error'
  }
};
```

### OWASP ZAP Integration

#### Basic ZAP Scan:
```bash
# Install ZAP
docker pull owasp/zap2docker-stable

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -J zap-report.json

# Run full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:3000 \
  -J zap-full-report.json
```

#### ZAP API Testing:
```javascript
// zap-api-test.js
const ZapClient = require('zaproxy');

async function runSecurityScan() {
  const zap = new ZapClient({
    proxy: 'http://localhost:8080'
  });

  // Start ZAP
  await zap.core.newSession();
  
  // Spider the application
  const spiderScanId = await zap.spider.scan('http://localhost:3000');
  
  // Wait for spider to complete
  let progress = 0;
  while (progress < 100) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    progress = await zap.spider.status(spiderScanId);
  }

  // Run active scan
  const activeScanId = await zap.activeScan.scan('http://localhost:3000');
  
  // Wait for active scan to complete
  progress = 0;
  while (progress < 100) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    progress = await zap.activeScan.status(activeScanId);
  }

  // Get results
  const alerts = await zap.core.alerts();
  console.log('Security vulnerabilities found:', alerts.length);
  
  return alerts;
}

runSecurityScan().catch(console.error);
```

### CI/CD Security Pipeline

#### GitHub Actions Example:
```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run npm audit
      run: npm audit --audit-level=moderate
      
    - name: Run Snyk
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        
    - name: Run security unit tests
      run: npm run test:security
      
    - name: Start application
      run: |
        npm start &
        sleep 30
        
    - name: Run OWASP ZAP
      uses: zaproxy/action-baseline@v0.6.1
      with:
        target: 'http://localhost:3000'
```

---

## Best Practices

### Test Data Management

#### Secure Test Data:
```javascript
// Good: Use fake data for security tests
const testUser = {
  email: `security-test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Security Test User'
};

// Bad: Using real user data
const realUser = {
  email: 'john.doe@company.com',
  password: 'john_real_password'
};
```

#### Environment Separation:
```javascript
// config/test.js
module.exports = {
  database: {
    url: process.env.TEST_DATABASE_URL || 'postgres://localhost/todo_test'
  },
  jwt: {
    secret: 'test-secret-do-not-use-in-production'
  }
};
```

### Security Testing Checklist

#### Pre-deployment Checklist:
- [ ] All dependencies scanned for vulnerabilities
- [ ] Security unit tests passing
- [ ] DAST scan completed with no high/critical issues
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive information
- [ ] Authentication and authorization tested
- [ ] Input validation tested for all endpoints
- [ ] Rate limiting configured and tested
- [ ] Logging and monitoring in place

#### Code Review Security Checklist:
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Output encoding for XSS prevention
- [ ] Proper error handling without information disclosure
- [ ] Secure session management
- [ ] Appropriate access controls
- [ ] Cryptographic functions used correctly

### Security Testing in Different Environments

#### Development Environment:
- SAST tools integrated in IDE
- Security unit tests run locally
- Pre-commit hooks for secret scanning

#### Testing Environment:
- Full DAST scans
- Penetration testing
- Security regression tests

#### Staging Environment:
- Production-like security testing
- Performance impact of security controls
- Integration testing with security tools

#### Production Environment:
- Continuous monitoring
- Runtime application self-protection (RASP)
- Security information and event management (SIEM)

---

## Hands-On Exercises

### Exercise 1: Implement IDOR Protection

#### Current Vulnerability:
```javascript
// Vulnerable code
app.get('/api/todos/:id', authenticateToken, async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: parseInt(req.params.id) }
  });
  res.json(todo);
});
```

#### Secure Implementation:
```javascript
// Secure code
app.get('/api/todos/:id', authenticateToken, async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { 
      id: parseInt(req.params.id),
      userId: req.user.id  // Ensure user owns the todo
    }
  });
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json(todo);
});
```

#### Test Case:
```javascript
it('should prevent IDOR attacks', async () => {
  // Create todo for user A
  const userATodo = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'User A Todo' });

  // Try to access with user B token
  const response = await request(app)
    .get(`/api/todos/${userATodo.body.todo.id}`)
    .set('Authorization', `Bearer ${userBToken}`)
    .expect(404);

  expect(response.body.error).toBe('Todo not found');
});
```

### Exercise 2: Add Rate Limiting

#### Implementation:
```javascript
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts'
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
```

#### Test Case:
```javascript
it('should enforce rate limiting on auth endpoints', async () => {
  const requests = [];
  
  // Make 6 requests (exceeding limit of 5)
  for (let i = 0; i < 6; i++) {
    requests.push(
      request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
    );
  }
  
  const responses = await Promise.all(requests);
  const rateLimitedResponses = responses.filter(r => r.status === 429);
  
  expect(rateLimitedResponses.length).toBeGreaterThan(0);
});
```

### Exercise 3: Implement Security Headers

#### Modern Helmet.js Integration:
```javascript
const helmet = require('helmet');

app.use(helmet({
  // Disable deprecated X-XSS-Protection header
  xssFilter: false,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },

  // Only enable HSTS in production
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,

  // Configure referrer policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  }
}));
```

**Key Changes in Modern Helmet:**
- ❌ **Removed X-XSS-Protection** - Deprecated and potentially harmful
- ✅ **CSP handles XSS protection** - More robust and modern
- ✅ **Conditional HSTS** - Only in production to avoid development issues
- ✅ **Comprehensive CSP directives** - Better coverage than basic setup

#### Test Case:
```javascript
it('should include modern security headers', async () => {
  const response = await request(app)
    .get('/api/health')
    .expect(200);

  expect(response.headers['x-frame-options']).toBe('DENY');
  expect(response.headers['x-content-type-options']).toBe('nosniff');
  expect(response.headers['content-security-policy']).toContain("default-src 'self'");

  // X-XSS-Protection should NOT be present (deprecated)
  expect(response.headers['x-xss-protection']).toBeUndefined();

  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
  }
});
```

### Exercise 4: Input Sanitization

#### DOMPurify for XSS Prevention:
```javascript
const createDOMPurify = require('isomorphic-dompurify');
const DOMPurify = createDOMPurify();

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    });
  }
  next();
};

app.use('/api/todos', sanitizeInput);
```

#### Test Case:
```javascript
it('should sanitize XSS attempts', async () => {
  const maliciousPayload = {
    title: '<script>alert("XSS")</script>',
    description: '<img src="x" onerror="alert(1)">'
  };

  const response = await request(app)
    .post('/api/todos')
    .set('Authorization', `Bearer ${authToken}`)
    .send(maliciousPayload)
    .expect(201);

  expect(response.body.todo.title).not.toContain('<script>');
  expect(response.body.todo.description).not.toContain('onerror');
});
```

---

## Tools and Resources

### Free Security Testing Tools

#### SAST Tools:
- **SonarQube Community**: Free static analysis
- **Semgrep**: Open-source static analysis
- **ESLint Security Plugin**: JavaScript security linting
- **Bandit**: Python security linter

#### DAST Tools:
- **OWASP ZAP**: Free web application security scanner
- **Nikto**: Web server scanner
- **SQLMap**: SQL injection testing tool
- **Burp Suite Community**: Web vulnerability scanner

#### Dependency Scanning:
- **npm audit**: Built into npm
- **Snyk (Free tier)**: Vulnerability database
- **OWASP Dependency Check**: Free dependency scanner
- **GitHub Security Advisories**: Automated vulnerability alerts

### Commercial Tools

#### Enterprise SAST:
- **Veracode**: Comprehensive application security
- **Checkmarx**: Static code analysis
- **Fortify**: HP's application security testing

#### Enterprise DAST:
- **Acunetix**: Web application security scanner
- **Rapid7 AppSpider**: Dynamic security testing
- **Burp Suite Professional**: Advanced web security testing

### Learning Resources

#### Certification Programs:
- **CISSP**: Certified Information Systems Security Professional
- **CEH**: Certified Ethical Hacker
- **OSCP**: Offensive Security Certified Professional
- **GWEB**: GIAC Web Application Penetration Tester

#### Online Learning:
- **OWASP WebGoat**: Hands-on security learning
- **PortSwigger Web Security Academy**: Free web security training
- **Cybrary**: Free cybersecurity courses
- **SANS**: Premium security training

#### Books:
- "The Web Application Hacker's Handbook" by Dafydd Stuttard
- "OWASP Testing Guide v4"
- "Secure Coding in C and C++" by Robert Seacord
- "Application Security for the Android Platform" by Jeff Six

#### Communities:
- **OWASP Local Chapters**: Local security meetups
- **DEF CON Groups**: Hacker conferences and meetups
- **Bug Bounty Platforms**: HackerOne, Bugcrowd
- **Security Forums**: Reddit r/netsec, Stack Overflow

### Budgeting for Security Tools

#### Startup/Small Project ($0-$1000/year):
- Free tools: OWASP ZAP, npm audit, ESLint security
- Snyk free tier
- Manual testing with free resources

#### Medium Project ($1000-$10000/year):
- Snyk Pro
- Burp Suite Professional
- SonarQube Developer Edition
- Basic penetration testing

#### Enterprise ($10000+/year):
- Commercial SAST/DAST platforms
- Professional penetration testing
- Security consultants
- Dedicated security team

---

## Conclusion

Security testing is not a one-time activity but a continuous process that should be integrated into your development lifecycle. Start with the basics:

1. **Implement security unit tests** (like you already have)
2. **Add dependency scanning** with npm audit
3. **Integrate DAST tools** like OWASP ZAP
4. **Establish security practices** in your team
5. **Continuously learn** about new threats and countermeasures

Remember: Security is a journey, not a destination. Keep learning, keep testing, and keep your applications secure!

---

*This guide serves as a starting point for security testing. Always consult with security professionals for production applications handling sensitive data.*