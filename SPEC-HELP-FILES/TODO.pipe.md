# CI/CD Pipeline Setup Guide

## GitHub Actions - Unit Tests Pipeline

### Goal
Automatically run unit tests on every push/PR to prevent broken code from reaching main branch.

---

## Setup Steps

### 1. Create Workflow File

```powershell
# Create directories
mkdir -p .github/workflows

# Create workflow file (use your editor)
# File: .github/workflows/test.yml
```

---

### 2. Basic Workflow Configuration

**File:** `.github/workflows/test.yml`

```yaml
name: Unit Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run unit tests
        working-directory: ./backend
        run: npm test
```

---

## Workflow Breakdown

### Trigger Events
```yaml
on:
  push:
    branches: [ main, master ]  # Run on pushes to main/master
  pull_request:
    branches: [ main, master ]  # Run on PRs targeting main/master
```

**Why:** Catch issues before they reach main branch.

---

### Job Configuration
```yaml
jobs:
  test:
    runs-on: ubuntu-latest  # Use Ubuntu runner (free tier)
```

**Alternatives:**
- `windows-latest` (Windows runner)
- `macos-latest` (macOS runner)

**Why Ubuntu:** Fastest, most common, free minutes on GitHub.

---

### Steps Explained

#### Step 1: Checkout Code
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```
**What it does:** Downloads your repository code to the runner.

---

#### Step 2: Setup Node.js
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: backend/package-lock.json
```

**What it does:**
- Installs Node.js version 20
- Caches `node_modules` for faster builds
- Uses `backend/package-lock.json` as cache key

**Why cache:** Speeds up workflow (1-2 min í 30 sec).

---

#### Step 3: Install Dependencies
```yaml
- name: Install dependencies
  working-directory: ./backend
  run: npm ci
```

**What it does:**
- `cd backend` (working-directory)
- `npm ci` (clean install from package-lock.json)

**Why `npm ci` not `npm install`:**
- Faster (optimized for CI)
- Uses exact versions from package-lock.json
- Deletes `node_modules` first (clean state)

---

#### Step 4: Run Tests
```yaml
- name: Run unit tests
  working-directory: ./backend
  run: npm test
```

**What it does:**
- Runs your 127 unit tests
- Exits with code 0 (success) or 1 (failure)
- GitHub shows  or L based on exit code

---

## Advanced Workflow (Optional)

### With Coverage Report

```yaml
name: Unit Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run unit tests with coverage
        working-directory: ./backend
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          files: ./backend/coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

---

### Multiple Node Versions (Matrix Strategy)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
        working-directory: ./backend

      - run: npm test
        working-directory: ./backend
```

**Result:** Tests run on Node 18, 20, and 22 simultaneously.

---

## Commit and Push

### 1. Add Workflow File
```powershell
git add .github/workflows/test.yml
git commit -m "Add GitHub Actions workflow for unit tests"
```

### 2. Push to GitHub
```powershell
git push origin main
```

### 3. View Workflow
```
1. Go to your GitHub repository
2. Click "Actions" tab
3. See workflow running
4. Click workflow to view logs
```

---

## Verify Workflow Works

### Test 1: Break a Test (Intentionally)
```typescript
// backend/tests/unit/controllers/auth.controller.test.ts
it('should register user', async () => {
  expect(true).toBe(false);  // L Force failure
});
```

**Commit and push:**
```powershell
git add .
git commit -m "Test: break unit tests"
git push
```

**Expected:** GitHub Actions shows L red X, workflow fails.

---

### Test 2: Fix the Test
```typescript
it('should register user', async () => {
  expect(true).toBe(true);  //  Fix
});
```

**Commit and push:**
```powershell
git add .
git commit -m "Test: fix unit tests"
git push
```

**Expected:** GitHub Actions shows  green checkmark.

---

## Branch Protection Rules (Optional)

### Enable Required Status Checks

**Steps:**
1. Go to repository Settings
2. Click "Branches"
3. Add rule for `main` branch
4. Check "Require status checks to pass"
5. Select "Unit Tests" workflow
6. Check "Require branches to be up to date"
7. Save changes

**Result:** Can't merge PR unless tests pass.

---

## Workflow Status Badge (Optional)

### Add Badge to README

```markdown
# Todo App

![Unit Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)

Your project description...
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO` with your repository name

**Result:** README shows test status ( passing or L failing).

---

## Troubleshooting

### Workflow Not Running
```yaml
# Check trigger branches match your branch name
on:
  push:
    branches: [ main ]  # ê Must match your branch (main or master)
```

### `npm ci` Fails
```
Error: package-lock.json not found
```

**Fix:** Ensure `package-lock.json` exists in backend folder.

```powershell
cd backend
npm install  # Generates package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
```

### Tests Fail in CI But Pass Locally
```
Common causes:
- Environment variables missing
- Node version mismatch
- Timezone differences
```

**Fix:**
```yaml
# Add environment variables
- name: Run tests
  env:
    NODE_ENV: test
    TZ: UTC
  run: npm test
```

### Cache Issues
```
Tests failing after dependency update
```

**Fix:** Clear cache manually in GitHub Actions UI, or:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    # Remove cache-dependency-path to force fresh install
```

---

## Next Steps After Unit Tests Pipeline

### 1. Add E2E Tests to Pipeline
```yaml
jobs:
  unit:
    # ... (unit tests)

  e2e:
    needs: unit  # Run after unit tests pass
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: todo_dev
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
        working-directory: ./backend
      - run: npm run test:e2e
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/todo_dev
```

---

### 2. Add Docker Build
```yaml
jobs:
  test:
    # ... (tests)

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t todo-backend ./backend
      - name: Test Docker image
        run: docker run --rm todo-backend npm test
```

---

### 3. Add Deployment
```yaml
jobs:
  test:
    # ... (tests)

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: # Deployment commands
```

---

## CI/CD Best Practices

### 1. Fast Feedback
```yaml
# Run quick checks first
jobs:
  lint:      # 10 seconds
  typecheck: # 30 seconds
  unit:      # 1 minute
  e2e:       # 3 minutes (runs after unit)
  deploy:    # 2 minutes (runs after e2e)
```

### 2. Parallel Jobs
```yaml
jobs:
  unit:
    runs-on: ubuntu-latest
    # Runs independently

  lint:
    runs-on: ubuntu-latest
    # Runs in parallel with unit
```

### 3. Only Deploy from Main
```yaml
deploy:
  if: github.ref == 'refs/heads/main'
  # Never deploy from feature branches
```

### 4. Use Secrets for Sensitive Data
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}  # ê Set in repo settings
```

---

## Success Criteria

- [ ] Workflow file created (`.github/workflows/test.yml`)
- [ ] Workflow runs on push to main
- [ ] Workflow runs on pull requests
- [ ] All 127 unit tests pass in CI
- [ ] Workflow shows green checkmark on success
- [ ] Workflow shows red X on failure
- [ ] (Optional) Branch protection enabled
- [ ] (Optional) Status badge added to README

---

## Quick Reference

### View Workflow Status
```
GitHub repo í Actions tab í Select workflow run
```

### Re-run Failed Workflow
```
Actions tab í Failed workflow í "Re-run jobs"
```

### View Workflow Logs
```
Actions tab í Workflow run í Click job í Expand step
```

### Cancel Running Workflow
```
Actions tab í Running workflow í "Cancel workflow"
```

---

## Key Learnings

- **CI/CD = Continuous Integration/Continuous Deployment**
- **GitHub Actions = Free CI/CD for public repos** (2000 min/month free)
- **Workflow = YAML file defining automated tasks**
- **Job = Set of steps running on same runner**
- **Step = Individual task (checkout, install, test, etc.)**
- **Runner = Virtual machine executing workflow** (Ubuntu/Windows/macOS)
- **Artifact = File generated by workflow** (coverage reports, build output)

**CI catches bugs before production. Essential for professional development.**
