# Docker Containerization Guide - Production Best Practices

**Staff SDET Perspective:** Containerization is essential for consistent environments across dev, test, and production. Master these patterns to avoid production incidents.

**Key Workflow Insight:** When making backend code changes, you DON'T need to delete images or volumes. Just run `docker-compose up --build -d` and Docker will handle the rebuild intelligently using cached layers (30-60s). The hybrid approach (Docker backend + local frontend) provides the best development experience.

---

## Quick Checklist: Containerizing Your Application

**Setup Phase:**
- [ ] Create multi-stage Dockerfile (build + production)
- [ ] Create .dockerignore (exclude secrets, tests, node_modules)
- [ ] Verify tsconfig.json NOT excluded (needed for build)
- [ ] Add HEALTHCHECK to Dockerfile
- [ ] Create docker-compose.yml (define all services)
- [ ] Configure environment variables (use container names for hosts)
- [ ] Set up data persistence with volumes
- [ ] Configure health checks with dependencies

**Verification Phase:**
- [ ] Build image successfully (`docker-compose up --build`)
- [ ] Both containers show `(healthy)` status
- [ ] Migrations run automatically on startup
- [ ] Health endpoint returns 200
- [ ] API endpoints work via curl
- [ ] Data persists after `docker-compose down/up`

**Daily Workflow:**
- [ ] Start backend: `docker-compose up -d`
- [ ] Start frontend: `cd frontend && npm run dev` (separate terminal)
- [ ] Backend code change: `docker-compose up --build -d` (no frontend restart needed)
- [ ] Frontend code change: Auto hot reload (no action needed)
- [ ] End of day: `docker-compose down` (backend) + `Ctrl+C` (frontend)
- [ ] Troubleshooting: `docker-compose down -v` (nuclear option - fresh DB)

---

## Part 1: Dockerfile - Multi-Stage Build

### Why Multi-Stage Build?

**Problem with single-stage:**
```
Single stage → Final image contains:
- Source code (.ts files)
- Dev dependencies (jest, typescript, eslint)
- Build tools
- Compiled code (.js files)
Result: ~500MB image
```

**Solution with multi-stage:**
```
Build stage → Compile code → Discard
Production stage → Copy only compiled code
Result: ~150MB image
```

### Example Dockerfile (backend/Dockerfile)

```dockerfile
# ============================================
# BUILD STAGE
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript → JavaScript
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# ============================================
# PRODUCTION STAGE
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
# --ignore-scripts: Skip lifecycle scripts (like husky git hooks)
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy ONLY compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (documentation only)
EXPOSE 5000

# Health check - Docker monitors container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/server.js"]
```

### Key Dockerfile Patterns Explained

**1. Why `npm ci --omit=dev --ignore-scripts`?**

```bash
npm ci                    # Clean install (faster than npm install)
--omit=dev               # Skip devDependencies (jest, typescript, etc.)
--ignore-scripts         # Skip "prepare" scripts (husky, postinstall)
```

**Problem without `--ignore-scripts`:**
```
Production stage:
├─ npm ci --omit=dev  → Doesn't install husky (dev dependency)
├─ npm runs "prepare" script automatically
├─ "prepare": "husky" → Tries to run husky command
└─ ERROR: husky not found (because --omit=dev)
```

**2. Why copy package files separately?**

```dockerfile
# ✅ Good (layer caching)
COPY package*.json ./
RUN npm ci
COPY . .

# ❌ Bad (reinstalls on every code change)
COPY . .
RUN npm ci
```

**Docker caching:**
- If package.json unchanged → reuse cached `npm ci` layer
- If code changed → only rebuild from `COPY . .` forward
- Saves 30-60 seconds per build

**3. Why `COPY --from=builder`?**

```dockerfile
COPY --from=builder /app/dist ./dist
```

**This is the magic:**
- Reaches into PREVIOUS stage (builder)
- Grabs only `/app/dist` folder
- Leaves everything else behind (source, dev deps, node_modules)
- Keeps production image small

---

## Part 2: .dockerignore - Exclude Files

### Purpose

**Like .gitignore but for Docker:** Tells Docker what NOT to copy into the image.

### Example .dockerignore

```dockerignore
# Dependencies (installed via npm ci)
node_modules
npm-debug.log

# Tests (not needed in production)
tests
*.test.ts
*.spec.ts
coverage

# Build artifacts (generated during build)
dist
build

# Environment files (NEVER include secrets!)
.env
.env.*
!.env.example

# Git files
.git
.gitignore
.github

# IDE files
.vscode
.idea

# Documentation
README.md
*.md
!prisma/*.md

# Docker files (don't need Dockerfile inside image)
Dockerfile
.dockerignore
docker-compose.yml

# Dev config (exclude MOST, but NOT tsconfig.json!)
.prettierrc
.eslintrc*
# tsconfig.json - NEEDED for build, don't exclude!
jest.config.js
jest.e2e.config.js
nodemon.json
```

### Critical Mistake: Excluding tsconfig.json

**Problem we encountered:**
```dockerfile
# In Dockerfile
RUN npm run build
↓
Runs: tsc
↓
Without tsconfig.json: Shows help message instead of compiling
↓
Build fails
```

**Rule:** Exclude dev tools, BUT keep build-critical files:
- ✅ Keep: `tsconfig.json` (TypeScript config)
- ✅ Keep: `package.json` (dependencies)
- ✅ Keep: `prisma/schema.prisma` (DB schema)
- ❌ Exclude: `.env` (secrets!)
- ❌ Exclude: `tests/` (not needed in production)

---

## Part 3: docker-compose.yml - Orchestration

### Purpose

**Dockerfile** = Recipe for one container (e.g., backend)
**docker-compose.yml** = Orchestrate multiple containers (backend + postgres)

### Example docker-compose.yml

```yaml
services:
  # ============================================
  # PostgreSQL Database Service
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: todo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todo_dev
    ports:
      - "5432:5432"
    volumes:
      # Persist data between restarts
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - todo-network

  # ============================================
  # Backend API Service
  # ============================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: todo-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      # CRITICAL: Use container name 'postgres', NOT 'localhost'
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/todo_dev
      JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
      JWT_EXPIRES_IN: 24h
      PORT: 5000
      NODE_ENV: production
      RATE_LIMIT_WINDOW_MS: 900000
      RATE_LIMIT_MAX_REQUESTS: 100
    ports:
      - "5000:5000"
    networks:
      - todo-network
    # Run migrations before starting server
    command: sh -c "npx prisma migrate deploy && node dist/server.js"

# ============================================
# Volumes - Data Persistence
# ============================================
volumes:
  postgres_data:
    driver: local

# ============================================
# Networks - Container Communication
# ============================================
networks:
  todo-network:
    driver: bridge
```

### Key Concepts Explained

#### 1. Port Mapping

```yaml
ports:
  - "5432:5432"
     ↑      ↑
   host   container
```

**Meaning:**
- Left (5432): Port on YOUR computer
- Right (5432): Port inside container
- Result: `localhost:5432` on your computer → container port 5432

**Why expose postgres?**
- Access from pgAdmin/DBeaver on your computer
- Tests connect to `localhost:5432`

#### 2. Container Networking

**Inside docker-compose network:**
```
Backend container:
├─ Can reach postgres via: postgres:5432 (container name)
├─ CANNOT use: localhost:5432 (that's backend's own localhost)
└─ DATABASE_URL must be: postgresql://user:pass@postgres:5432/db
                                                    ↑
                                            container name, NOT localhost
```

**From your computer:**
```
Your tests:
├─ Connect to: localhost:5432 (port mapping)
├─ Docker forwards to: postgres container
└─ DATABASE_URL can use: postgresql://user:pass@localhost:5432/db
```

#### 3. Volumes - Data Persistence

**Without volumes:**
```
1. Start container → create database
2. Add data
3. Stop container
4. Start container → data GONE ❌
```

**With volumes:**
```
1. Start container → create database
2. Add data → stored in volume (on your computer)
3. Stop container → volume persists
4. Start container → data still there ✅
```

**Where is data stored?**
- Docker manages it
- Windows: `\\wsl$\docker-desktop-data\data\docker\volumes\`
- Linux: `/var/lib/docker/volumes/`

**To delete volume:**
```bash
docker-compose down -v
```

#### 4. depends_on with Health Check

**Problem without `depends_on`:**
```
1. Backend starts immediately
2. Postgres still booting (takes 10-15 seconds)
3. Backend tries to connect → fails
4. Backend crashes ❌
```

**Solution with `condition: service_healthy`:**
```
1. Postgres starts
2. Healthcheck runs every 10s
3. After postgres healthy → backend starts
4. Backend connects successfully ✅
```

**Healthcheck for postgres:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s      # Check every 10 seconds
  timeout: 5s        # Fail if no response in 5s
  retries: 5         # 5 failures = unhealthy
  start_period: 10s  # Grace period on startup
```

#### 5. Restart Policies

```yaml
restart: unless-stopped
```

**Options:**
- `no` - Never restart (default)
- `always` - Always restart (even after manual stop)
- `on-failure` - Restart only if crashed
- `unless-stopped` - Restart unless manually stopped (recommended)

**Why `unless-stopped`?**
- Auto-restart on crashes
- Survives computer reboot
- Respects manual `docker-compose down`

---

## Part 4: Daily Workflow & Commands

### Command Reference Table

| Command | Stops | Removes Containers | Removes Volumes | Removes Images | Use Case |
|---------|-------|-------------------|-----------------|----------------|----------|
| `docker-compose stop` | ✅ | ❌ | ❌ | ❌ | Quick pause |
| `docker-compose down` | ✅ | ✅ | ❌ | ❌ | **Daily shutdown** |
| `docker-compose down -v` | ✅ | ✅ | ✅ | ❌ | Fresh start |
| `docker-compose down --rmi all` | ✅ | ✅ | ❌ | ✅ | Clean images |
| `docker-compose down -v --rmi all` | ✅ | ✅ | ✅ | ✅ | Nuclear option |

### Startup Commands

```bash
# Start in foreground (see logs, blocks terminal)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild images + start (after code changes)
docker-compose up --build

# Rebuild + background
docker-compose up --build -d

# Force recreate containers (troubleshooting)
docker-compose up --force-recreate
```

### Monitoring Commands

```bash
# Check running containers
docker-compose ps

# Check all containers (including stopped)
docker-compose ps -a

# View logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs postgres

# Follow logs for specific service
docker-compose logs -f backend

# Check resource usage
docker stats

# View volumes
docker volume ls

# Inspect volume
docker volume inspect todo_postgres_data

# View networks
docker network ls
```

### Container Interaction

```bash
# Execute command in running container
docker-compose exec backend sh

# Inside container, you can:
ls                          # List files
npx prisma migrate status   # Check migrations
node dist/server.js         # Run server manually
exit                        # Exit container

# Run one-off command
docker-compose exec backend npx prisma migrate status

# View container details
docker inspect todo-backend
```

### Recommended Daily Workflow

**End of Session:**
```bash
# Stop and remove containers, keep data
docker-compose down
```

**Start of Session:**
```bash
# Start in background
docker-compose up -d

# Verify running
docker-compose ps

# Check logs if needed
docker-compose logs backend
```

**After Code Changes:**
```bash
# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Verify
docker-compose ps
curl http://localhost:5000/health
```

**When Migrations Fail / DB Corrupted:**
```bash
# Nuclear option - delete everything
docker-compose down -v
docker-compose up --build

# Data will be recreated from scratch
```

---

## Part 5: Frontend Development Workflow

### The Hybrid Approach (Recommended)

**Best practice for full-stack development:**
- Backend: Running in Docker (production-like environment)
- Frontend: Running locally (fast hot reload, easy debugging)

**Why this approach?**
- ✅ Backend isolated in containers (consistent with production)
- ✅ Frontend hot reload works perfectly (instant changes)
- ✅ Easy to debug frontend in browser DevTools
- ✅ Backend changes don't affect frontend development speed
- ✅ Realistic testing (frontend talking to containerized backend)

### Setup: Docker Backend + Local Frontend

**Terminal 1: Start Docker backend**
```bash
# From project root
docker-compose up -d

# Verify it's running
docker-compose ps
curl http://localhost:5000/health
```

**Terminal 2: Start local frontend**
```bash
# In separate terminal
cd frontend
npm install
npm run dev

# Frontend runs on: http://localhost:5173 (Vite default)
# Frontend connects to: http://localhost:5000 (Docker backend)
```

**Architecture:**
```
Your Computer
├─ Docker Backend (port 5000)
│  ├─ API endpoints
│  └─ Docker Postgres (port 5432)
│
└─ Local Frontend (port 5173)
   └─ Connects to: http://localhost:5000
```

### Frontend API Configuration

**In your frontend code:**
```typescript
// frontend/src/config.ts
export const API_BASE_URL = 'http://localhost:5000';

// frontend/src/api/client.ts
import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
```

**Making API calls:**
```typescript
// Frontend talks to Docker backend
const response = await apiClient.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

### Workflow: Making Backend Changes

**Scenario: You need to add a new API endpoint**

```bash
# 1. Edit backend code
# backend/src/controllers/todos.controller.ts
# backend/src/routers/todos.ts

# 2. Rebuild Docker (NO need to stop frontend!)
docker-compose up --build -d

# 3. Verify backend change
curl http://localhost:5000/api/your-new-endpoint

# 4. Frontend automatically uses new endpoint
# (Frontend keeps running, no restart needed)
```

**Key insight:** You DON'T need to:
- ❌ Stop frontend
- ❌ Delete Docker images
- ❌ Delete volumes (unless DB schema changed)
- ❌ Run `docker-compose down` first

**Just rebuild:**
```bash
docker-compose up --build -d
```

**Time:** ~30-60 seconds (Docker uses cached layers)

### Common Development Scenarios

#### Scenario 1: Pure Frontend Work

```bash
# Docker backend running in background
docker-compose up -d

# Work on frontend
cd frontend
npm run dev

# Make changes to React components, CSS, etc.
# Changes hot reload instantly ✅
# No need to touch Docker
```

#### Scenario 2: Backend API Change

```bash
# Frontend still running in Terminal 2

# Terminal 1: Rebuild backend
docker-compose up --build -d

# Wait 30-60 seconds

# Frontend now uses updated API
# Refresh browser if needed
```

#### Scenario 3: Database Schema Change

```bash
# 1. Update Prisma schema
# backend/prisma/schema.prisma

# 2. Create migration (locally)
cd backend
npx prisma migrate dev --name add_new_field

# 3. Rebuild Docker (applies migration)
cd ..
docker-compose down -v  # Fresh DB for testing
docker-compose up --build

# 4. Frontend uses new schema
```

#### Scenario 4: Testing Full E2E Flow

```bash
# Both running:
# - Docker backend: localhost:5000
# - Local frontend: localhost:5173

# Test in browser:
# 1. Open http://localhost:5173
# 2. Use frontend UI
# 3. Check Network tab (calls to localhost:5000)
# 4. Verify backend logs: docker-compose logs -f backend
```

### Troubleshooting CORS Issues

**Problem:** Frontend can't connect to Docker backend

**Error in browser console:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution: Enable CORS in backend (already configured)**

**backend/src/server.ts:**
```typescript
import cors from 'cors';

app.use(cors());  // ✅ Allows all origins in development

// For production, specify allowed origins:
app.use(cors({
  origin: ['https://your-frontend-domain.com']
}));
```

**Verify CORS working:**
```bash
# From frontend, make API call
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/auth/login

# Should return: Access-Control-Allow-Origin: *
```

### Quick Command Reference

**Daily workflow:**

| Action | Command | Terminal |
|--------|---------|----------|
| **Start backend** | `docker-compose up -d` | 1 |
| **Start frontend** | `cd frontend && npm run dev` | 2 |
| **Backend change** | `docker-compose up --build -d` | 1 |
| **Frontend change** | (auto hot reload) | - |
| **Stop backend** | `docker-compose down` | 1 |
| **Stop frontend** | `Ctrl+C` | 2 |
| **View backend logs** | `docker-compose logs -f backend` | 1 or 3 |
| **Fresh DB** | `docker-compose down -v && docker-compose up` | 1 |

### Alternative: Full Docker Setup (Later)

**When you want everything in Docker:**

```yaml
# docker-compose.yml (future enhancement)
services:
  postgres:
    # ... (existing)

  backend:
    # ... (existing)

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://backend:5000  # Uses container name
```

**When to use full Docker:**
- CI/CD pipeline
- Team onboarding (single `docker-compose up`)
- Testing deployment configuration
- Production-like environment

**For daily development, hybrid approach is faster!**

### Workflow Comparison

**Hybrid (Recommended for Development):**
```
Start time: 5s (Docker) + 2s (npm run dev) = 7s
Frontend change: Instant hot reload
Backend change: 30-60s rebuild
Debugging: Easy (browser DevTools)
```

**Full Docker:**
```
Start time: 30-60s (build both images)
Frontend change: 30s rebuild OR volume mount + slower hot reload
Backend change: 30-60s rebuild
Debugging: Harder (containerized)
```

### Pro Tips

**1. Keep Docker backend running all day**
```bash
# Morning: Start once
docker-compose up -d

# Work all day
cd frontend && npm run dev

# Evening: Stop
docker-compose down
```

**2. Alias for quick rebuild**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias dc-rebuild="docker-compose up --build -d"

# Usage:
dc-rebuild
```

**3. Monitor backend while developing**
```bash
# Terminal 3: Watch logs
docker-compose logs -f backend

# See API calls in real-time as frontend makes requests
```

**4. Quick health check script**
```bash
# check-backend.sh
#!/bin/bash
if curl -s http://localhost:5000/health | grep -q "healthy"; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend is down"
  docker-compose logs --tail=20 backend
fi
```

---

## Part 6: Troubleshooting Guide

### Problem 1: Port Already in Use

**Error:**
```
Error: bind: address already in use
Error: listen tcp 0.0.0.0:5000: bind: Only one usage of each socket address
```

**Investigation Commands:**

**Windows:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Output:
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    39964
                                                  ↑
                                            Process ID

# Find the process
tasklist | findstr "39964"

# Output shows:
node.exe              39964    # Local dev server
com.docker.backend.exe 39964   # Docker container
Code.exe              39964    # VS Code terminal
```

**Linux/Mac:**
```bash
# Find what's using port 5000
lsof -i :5000

# Output:
COMMAND   PID  USER
node      1234 user
docker    5678 user

# Kill process
kill -9 1234
```

**Solutions:**

**Option A: Stop conflicting process**
```bash
# Stop local dev server
# Ctrl+C in terminal running npm run dev

# Or kill process
taskkill /PID 39964 /F   # Windows
kill -9 1234             # Linux/Mac
```

**Option B: Change Docker port**
```yaml
# docker-compose.yml
backend:
  ports:
    - "5001:5000"  # Use port 5001 on host

# Access at: http://localhost:5001
```

---

### Problem 2: Backend Can't Connect to Database

**Error in logs:**
```
Error: connect ECONNREFUSED postgres:5432
```

**Possible Causes:**

**1. Postgres not healthy yet**
```bash
# Check postgres logs
docker-compose logs postgres

# Look for:
"database system is ready to accept connections"

# Solution: Wait 15-20 seconds, postgres needs time to initialize
```

**2. Wrong DATABASE_URL**
```yaml
# ❌ Wrong - uses localhost
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/todo_dev

# ✅ Correct - uses container name
DATABASE_URL: postgresql://postgres:postgres@postgres:5432/todo_dev
                                                    ↑
                                            container name
```

**3. Network issue**
```bash
# Check networks
docker network ls

# Check if containers on same network
docker network inspect todo_todo-network
```

---

### Problem 3: Migrations Fail

**Error:**
```
Migration failed: relation "User" already exists
```

**Solution:**
```bash
# Option 1: Reset database (loses data)
docker-compose down -v
docker-compose up --build

# Option 2: Enter container and fix manually
docker-compose exec backend sh
npx prisma migrate reset
npx prisma migrate deploy
exit
```

---

### Problem 4: Health Check Failing

**Container shows `(unhealthy)` status**

**Investigation:**
```bash
# View backend logs
docker-compose logs backend

# Test health endpoint manually
curl http://localhost:5000/health

# Enter container and debug
docker-compose exec backend sh
wget -O- http://localhost:5000/health
exit
```

**Common causes:**
- Database connection failed
- Health endpoint crashed
- Port 5000 not exposed properly

---

### Problem 5: Changes Not Reflected

**Made code changes but Docker still runs old code**

**Solution:**
```bash
# Force rebuild (no cache)
docker-compose build --no-cache
docker-compose up -d

# Or
docker-compose down
docker-compose up --build -d
```

**Why this happens:**
- Docker caches layers
- Sometimes cache doesn't detect changes
- `--no-cache` forces rebuild from scratch

---

## Part 7: Testing Strategy

### Test Scenarios

**Scenario 1: Test Local Code + Docker Database (E2E Tests)**
```bash
# Tests run local TypeScript code
# Connect to Docker postgres
cd backend
npm run test:e2e

# What happens:
Tests → Local code (src/**/*.ts)
      → Docker postgres (localhost:5432)
```

**Scenario 2: Test Docker Backend (Integration Tests)**
```bash
# Test actual Docker container over HTTP
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

**Scenario 3: Full E2E in Docker**
```bash
# Run tests inside Docker container
docker-compose exec backend npm run test:e2e
```

### Verification Checklist

**After `docker-compose up --build`:**

```bash
# 1. Check container status
docker-compose ps
# Expected: Both containers "Up" and "(healthy)"

# 2. Check backend logs
docker-compose logs backend
# Expected: "Server running on port 5000"
#           "Database migrations applied successfully"

# 3. Test health endpoint
curl http://localhost:5000/health
# Expected: {"status":"healthy","timestamp":"..."}

# 4. Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
# Expected: {"message":"User registered successfully","token":"..."}

# 5. Test persistence
docker-compose down
docker-compose up -d
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
# Expected: Login succeeds (data persisted)
```

---

## Part 8: Best Practices Summary

### Dockerfile Best Practices

✅ **DO:**
- Use multi-stage builds (build + production)
- Use Alpine images (smaller size)
- Use `npm ci` instead of `npm install` (faster, more reliable)
- Use `COPY package*.json` before `COPY . .` (layer caching)
- Use `--omit=dev` in production stage
- Use `--ignore-scripts` to skip lifecycle scripts
- Add HEALTHCHECK directive
- Set CMD with array syntax: `CMD ["node", "server.js"]`

❌ **DON'T:**
- Run as root user (alpine images use node user by default)
- Copy node_modules (install via npm ci)
- Include secrets in image
- Use latest tag in production
- Forget to expose ports

### docker-compose Best Practices

✅ **DO:**
- Use named volumes for persistence
- Use healthchecks with `depends_on`
- Use custom networks (isolation)
- Use `restart: unless-stopped`
- Use container names for inter-service communication
- Document exposed ports

❌ **DON'T:**
- Use `localhost` in DATABASE_URL (use container names)
- Use `version: '3.8'` (obsolete in newer Docker)
- Hardcode secrets (use .env files, not in docker-compose.yml)
- Expose unnecessary ports
- Forget to map volumes for data persistence

### .dockerignore Best Practices

✅ **DO:**
- Exclude node_modules (installed via npm ci)
- Exclude .env files (secrets)
- Exclude tests/ (not needed in production)
- Exclude .git/ (not needed)
- Keep tsconfig.json (needed for build)
- Keep package.json (needed for build)

❌ **DON'T:**
- Exclude build-critical files (tsconfig.json, package.json)
- Forget to exclude secrets
- Copy entire project without exclusions

### Security Best Practices

✅ **DO:**
- Never include .env in image
- Use .dockerignore to exclude secrets
- Use multi-stage builds (smaller attack surface)
- Run as non-root user
- Use specific image versions (not `latest`)
- Keep base images updated

❌ **DON'T:**
- Commit .env to git
- Build images with secrets in ENV
- Run containers as root
- Use outdated base images

---

## Part 9: Common Patterns & Examples

### Pattern 1: Development vs Production

**Development (docker-compose.yml):**
```yaml
backend:
  build: ./backend
  volumes:
    - ./backend:/app        # Mount source code (hot reload)
    - /app/node_modules     # Don't overwrite node_modules
  environment:
    NODE_ENV: development
  command: npm run dev      # Use nodemon
```

**Production (docker-compose.prod.yml):**
```yaml
backend:
  image: myregistry.com/backend:1.0.0
  # No volumes (use built image)
  environment:
    NODE_ENV: production
  command: node dist/server.js
```

### Pattern 2: Environment Variables

**Option A: In docker-compose.yml (current approach)**
```yaml
services:
  backend:
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
      JWT_SECRET: secret123
```

**Option B: .env file (recommended for secrets)**
```yaml
services:
  backend:
    env_file:
      - .env.docker
```

**.env.docker:**
```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/db
JWT_SECRET=secret123
```

**⚠️ Never commit .env files to git!**

### Pattern 3: Running Migrations

**Option A: Startup command (current approach)**
```yaml
backend:
  command: sh -c "npx prisma migrate deploy && node dist/server.js"
```

**Option B: Separate init container**
```yaml
services:
  migrate:
    build: ./backend
    command: npx prisma migrate deploy
    depends_on:
      postgres:
        condition: service_healthy

  backend:
    build: ./backend
    depends_on:
      migrate:
        condition: service_completed_successfully
```

---

## Part 10: Quick Reference

### Port Investigation (Windows)

```bash
# Find what's using a port
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# Find process by PID
tasklist | findstr "PID_NUMBER"

# Kill process
taskkill /PID PID_NUMBER /F
```

### Port Investigation (Linux/Mac)

```bash
# Find what's using a port
lsof -i :5000
netstat -tulpn | grep :5000

# Kill process
kill -9 PID_NUMBER
```

### Docker Cleanup Commands

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune

# Remove everything INCLUDING VOLUMES
docker system prune -a --volumes
```

### Quick Fixes

```bash
# Can't connect to database
docker-compose logs postgres    # Check postgres ready
docker-compose restart backend  # Restart backend

# Port conflict
docker-compose down             # Stop all
# Kill conflicting process
docker-compose up -d            # Start fresh

# Changes not reflected
docker-compose up --build -d    # Force rebuild

# Database corrupted
docker-compose down -v          # Delete volumes
docker-compose up --build       # Fresh start

# Container stuck
docker-compose down             # Stop gracefully
docker-compose kill             # Force stop
docker-compose rm -f            # Remove containers
```

---

## Success Criteria Checklist

**Your Docker setup is complete when:**

- [ ] `docker-compose up --build` succeeds without errors
- [ ] `docker-compose ps` shows both containers `(healthy)`
- [ ] Backend logs show "Server running on port 5000"
- [ ] Backend logs show "Database migrations applied successfully"
- [ ] `curl http://localhost:5000/health` returns `{"status":"healthy"}`
- [ ] Can register user via API
- [ ] Can login with user via API
- [ ] Can create/read todos via API
- [ ] Data persists after `docker-compose down && docker-compose up`
- [ ] Local E2E tests pass (`npm run test:e2e`)
- [ ] Health check works: `docker inspect todo-backend | grep Health`
- [ ] Frontend (when built) connects to Docker backend successfully
- [ ] CORS configured correctly (no browser console errors)

---

## Related Files

- **Dockerfile:** `backend/Dockerfile`
- **Compose:** `docker-compose.yml` (project root)
- **Ignore:** `backend/.dockerignore`
- **Health endpoint:** `backend/src/server.ts` (lines 68-84)
- **Middleware guide:** `SPEC-HELP-FILES/GUIDE.middleware.md`

---

## Further Reading

- [Dockerfile best practices](https://docs.docker.com/develop/dev-best-practices/)
- [docker-compose reference](https://docs.docker.com/compose/compose-file/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker healthcheck](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [The Twelve-Factor App](https://12factor.net/)
