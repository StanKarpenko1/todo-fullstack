# Express Middleware & Observability - Best Practices Guide

**Staff SDET Perspective:** Middleware ordering and health checks are critical for production reliability. Get this wrong = cascading failures in containerized environments.

---

## Middleware Execution Order

**Rule:** Order matters. Request flows through middleware stack top-to-bottom.

### Correct Order (server.ts implementation)

```typescript
// 1. Security headers (applies to ALL requests)
app.use(helmet({ ... }))

// 2. CORS policy
app.use(cors())

// 3. Request size limits (DoS protection)
app.use(limitRequestSize)

// 4. Body parsing (needed for health endpoint if it reads body)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// 5. Health check endpoint (BEFORE rate limiter)
app.get('/health', async (req, res) => { ... })

// 6. Rate limiting (AFTER health check)
app.use(limiter)

// 7. Input sanitization (XSS protection)
app.use(sanitizeInput)

// 8. Business routes
app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)

// 9. Error handler (MUST be last)
app.use(errorHandler)
```

---

## Why Health Check Must Bypass Rate Limiter

### Problem Scenario

```
Production setup:
├─ Docker container running app
├─ Kubernetes health probe: every 10s
├─ Load balancer health check: every 10s
├─ Monitoring tool (Datadog): every 30s
└─ Uptime service: every 60s

Rate limit: 100 requests per 15 minutes
Math: (6 req/min × 15 min) + (6 req/min × 15 min) + (2 req/min × 15 min) + (1 req/min × 15 min)
    = 90 + 90 + 30 + 15 = 225 requests per 15 min

Result: Rate limit exceeded after ~7 minutes
```

### What Happens When /health Gets Rate Limited

```
1. Health endpoint returns 429 Too Many Requests
2. Kubernetes marks pod as unhealthy
3. Load balancer removes instance from pool
4. Traffic shifts to remaining instances
5. Remaining instances get overloaded
6. Their health checks start failing
7. Cascading failure → full outage
8. PagerDuty alert at 3am
```

### Solution

```typescript
// Place /health BEFORE rate limiter
app.get('/health', async (req, res) => { ... })
app.use(limiter)  // Rate limiter applied AFTER health check
```

**Observability endpoints should NEVER be rate limited:**
- `/health` - liveness/readiness probes
- `/metrics` - Prometheus/monitoring
- `/ready` - Kubernetes readiness checks

---

## Health Check Implementation Patterns

### ❌ Naive Implementation (Bad)

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})
```

**Problems:**
- Doesn't verify app is actually functional
- Container could be "running" with crashed DB connection
- Docker/K8s can't detect real failures
- Silent failures in production

### ✅ Production-Ready Implementation (Good)

```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    })
  }
})
```

**Benefits:**
- Returns 503 Service Unavailable on DB failure
- Docker healthcheck detects real problems
- Kubernetes restarts unhealthy pods automatically
- Actionable error message in logs

---

## HTTP Status Codes for Health Checks

| Code | Meaning | Docker Behavior | K8s Behavior |
|------|---------|-----------------|--------------|
| 200  | Healthy | Mark container healthy | Route traffic |
| 503  | Unhealthy (recoverable) | Wait for retries | Stop routing traffic |
| 500  | Server error | Wait for retries | Stop routing traffic |
| 429  | Rate limited | ⚠️ False negative | ⚠️ Marks unhealthy |

**Staff SDET note:** Never return 429 for health checks. Always return 200/503.

---

## Docker HEALTHCHECK Configuration

### Dockerfile Implementation

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {
    process.exit(r.statusCode === 200 ? 0 : 1)
  })"
```

**Parameters explained:**
- `--interval=30s` → Check every 30 seconds
- `--timeout=3s` → Fail if no response in 3s
- `--start-period=5s` → Grace period on startup
- `--retries=3` → Mark unhealthy after 3 consecutive failures

**Math:** Container marked unhealthy after 90s (3 retries × 30s interval)

### Why This Matters

```
Without HEALTHCHECK:
├─ App crashes due to DB connection failure
├─ Container process still running (exit code 0)
├─ Docker shows status: "Up 5 minutes"
└─ Requests hit dead app → 500 errors

With HEALTHCHECK:
├─ App crashes due to DB connection failure
├─ Health check returns 503 after 3 retries
├─ Docker shows status: "Up 5 minutes (unhealthy)"
└─ docker-compose restarts container automatically
```

---

## Testing Health Checks

### Manual Test

```bash
# Start app
npm run dev

# Test healthy state
curl http://localhost:5000/health
# Expected: {"status":"healthy","timestamp":"..."}

# Stop database
docker stop postgres-todo

# Test unhealthy state
curl http://localhost:5000/health
# Expected: 503 {"status":"unhealthy","error":"Database connection failed"}
```

### Automated E2E Test Pattern

```typescript
describe('Health Check', () => {
  it('should return 200 when app is healthy', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('healthy')
    expect(response.body.timestamp).toBeDefined()
  })

  it('should return 503 when database is unavailable', async () => {
    // Mock Prisma failure
    jest.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('DB down'))

    const response = await request(app).get('/health')

    expect(response.status).toBe(503)
    expect(response.body.status).toBe('unhealthy')
  })
})
```

---

## Common Pitfalls

### 1. Health Check Too Heavy

❌ **Bad:**
```typescript
app.get('/health', async (req, res) => {
  // Running complex queries
  await prisma.user.count()
  await prisma.todo.count()
  await redis.ping()
  await s3.listBuckets()
  // ...
})
```

**Problem:** Slow health checks timeout, mark healthy service as unhealthy.

✅ **Good:**
```typescript
app.get('/health', async (req, res) => {
  // Minimal query just to verify connection
  await prisma.$queryRaw`SELECT 1`
})
```

### 2. Synchronous Health Check

❌ **Bad:**
```typescript
app.get('/health', (req, res) => {
  prisma.$queryRaw`SELECT 1`  // Promise not awaited!
  res.status(200).json({ status: 'healthy' })
})
```

**Problem:** Always returns 200, even if DB is down.

### 3. Health Check Modifies State

❌ **Bad:**
```typescript
app.get('/health', async (req, res) => {
  // Writing to DB on every health check
  await prisma.healthCheck.create({
    data: { timestamp: new Date() }
  })
  res.status(200).json({ status: 'healthy' })
})
```

**Problem:** Pollutes DB with garbage data. Health checks called every 10s = 8,640 rows/day.

---

## Advanced: Separate Liveness vs Readiness

**Liveness:** Is the app process alive?
**Readiness:** Is the app ready to handle traffic?

```typescript
// Liveness: Basic check - is process running?
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' })
})

// Readiness: Full check - can we serve traffic?
app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redis.ping()

    res.status(200).json({ status: 'ready' })
  } catch (error) {
    res.status(503).json({ status: 'not ready' })
  }
})
```

**Kubernetes configuration:**
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

## Middleware Order Debugging

### How to Verify Middleware Order

```typescript
// Add logging middleware at various points
app.use((req, res, next) => {
  console.log('1. After helmet')
  next()
})

app.use(cors())
app.use((req, res, next) => {
  console.log('2. After cors')
  next()
})

// etc...
```

### Common Symptoms of Wrong Order

| Symptom | Likely Cause |
|---------|--------------|
| Health checks getting 429 | Health endpoint after rate limiter |
| Can't parse req.body | Body parser after route handlers |
| CORS errors | cors() placed after routes |
| Rate limiter not working | Defined but never called with `app.use()` |
| Errors not caught | errorHandler not last middleware |

---

## Key Takeaways (Staff SDET Perspective)

1. **Middleware order is security-critical**
   - Security headers first
   - Health checks before rate limiting
   - Error handler last

2. **Health checks must verify real dependencies**
   - Don't just return 200
   - Check DB connectivity with minimal query
   - Use proper HTTP status codes (200/503)

3. **Observability ≠ Business Logic**
   - Health/metrics endpoints bypass rate limiting
   - Keep health checks fast (<100ms)
   - Never modify state in health checks

4. **Docker integration is essential**
   - HEALTHCHECK directive catches real failures
   - Enables automatic container restarts
   - Critical for zero-downtime deployments

5. **Test your health checks**
   - Test both healthy and unhealthy states
   - Verify proper status codes
   - Include in E2E test suite

---

## Related Files

- **Implementation:** `backend/src/server.ts`
- **Docker config:** `backend/Dockerfile` (HEALTHCHECK)
- **Tests:** `backend/tests/e2e/*.e2e.test.ts`

---

## Further Reading

- [Express middleware documentation](https://expressjs.com/en/guide/using-middleware.html)
- [Kubernetes health checks best practices](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Docker HEALTHCHECK reference](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [The Twelve-Factor App - Disposability](https://12factor.net/disposability)
