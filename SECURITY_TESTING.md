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
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: default-src 'self'
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

#### Helmet.js Integration:
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### Test Case:
```javascript
it('should include security headers', async () => {
  const response = await request(app)
    .get('/api/health')
    .expect(200);

  expect(response.headers['x-frame-options']).toBe('DENY');
  expect(response.headers['x-content-type-options']).toBe('nosniff');
  expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
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