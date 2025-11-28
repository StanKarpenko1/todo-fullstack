# PostgreSQL Migration Guide

## Current State
- **Database:** SQLite (`file:./dev.db`)
- **ORM:** Prisma
- **Why migrate:** PostgreSQL needed for production (better concurrency, Docker readiness)

---

## Migration Steps

### 1. Install PostgreSQL

**Option A: Docker Container (Recommended - Easiest)**
```bash
docker run --name todo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=todo_dev \
  -p 5432:5432 \
  -d postgres:15

# Verify running
docker ps

# Connect to database
docker exec -it todo-postgres psql -U postgres -d todo_dev
```

**Option B: Manual Install**
- **Windows:** Download from https://www.postgresql.org/download/windows/
- **macOS:** `brew install postgresql@15 && brew services start postgresql@15`
- **Linux:** `sudo apt install postgresql postgresql-contrib`

**Option C: Package Managers**
```bash
# Windows (with Chocolatey package manager)
choco install postgresql

# Note: Chocolatey is a package manager for Windows (like apt/brew)
# Install from: https://chocolatey.org/install
```

---

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE todo_dev;

# Exit psql
\q
```

---

### 3. Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

```diff
datasource db {
-  provider = "sqlite"
-  url      = env("DATABASE_URL")
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
}
```

**No other changes needed** - Prisma handles dialect differences automatically!

---

### 4. Update Environment Variables

**File:** `backend/.env`

```diff
# Database
- DATABASE_URL="file:./dev.db"
+ DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_dev"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

---

### 5. Run Migration

```bash
cd backend

# Generate migration from current schema
npx prisma migrate dev --name switch_to_postgresql

# This will:
# 1. Create migration files
# 2. Apply migration to PostgreSQL
# 3. Generate Prisma Client for PostgreSQL
```

---

### 6. Verify Migration

**A. Check Database**
```bash
# Connect to PostgreSQL
psql -U postgres -d todo_dev

# List tables
\dt

# Check schema
\d "User"
\d "Todo"

# Exit
\q
```

**B. Run Unit Tests**
```bash
npm test

# Expected: All 106 tests pass
# Why: Tests are fully mocked (DB-agnostic)
```

**C. Manual API Testing**
```bash
# Start server
npm run dev

# Test endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

---

## Key Differences: SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Concurrency** | Single writer | Multiple writers |
| **Data Types** | Limited (5 types) | Rich (many types) |
| **JSON Support** | Basic | Advanced (JSONB) |
| **Full-Text Search** | Limited | Built-in (tsvector) |
| **Production Ready** | No (file-based) | Yes (client-server) |
| **Docker Friendly** | No (shared file) | Yes (separate container) |

---

## Prisma Handles Automatically

 **Data type mapping:**
- SQLite `TEXT` � PostgreSQL `VARCHAR`
- SQLite `INTEGER` � PostgreSQL `INTEGER`
- SQLite `DATETIME` � PostgreSQL `TIMESTAMP`

 **UUID generation:** Works on both databases
 **Migrations:** Dialect-specific SQL generated automatically
 **Queries:** Same Prisma Client API (no code changes!)

---

## Why Unit Tests Still Pass

```javascript
// Tests mock Prisma Client entirely
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),  // � Mocked, no real DB calls
      create: jest.fn(),
      update: jest.fn(),
    }
  }))
}));
```

**Result:** Tests never touch the database (SQLite or PostgreSQL)

---

## Rollback (If Needed)

```bash
# Revert Prisma schema
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# Revert .env
DATABASE_URL="file:./dev.db"

# Regenerate client
npx prisma generate
```

---

## Success Criteria

- [ ] PostgreSQL installed and running
- [ ] Database `todo_dev` created
- [ ] Prisma schema updated (`provider = "postgresql"`)
- [ ] `.env` updated with PostgreSQL connection string
- [ ] Migration executed successfully
- [ ] All 106 unit tests passing
- [ ] API endpoints working (manual test)
- [ ] Data persists across server restarts

---

## Next Steps After Migration

1.  **Test production patterns** - Connection pooling, transactions
2.  **Docker setup** - Multi-container with PostgreSQL
3.  **Frontend development** - Build on solid backend
4.  **Deployment** - PostgreSQL-ready for Heroku, Railway, AWS

---

## Troubleshooting

**Connection refused:**
```bash
# Check PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app for "postgresql" service
```

**Authentication failed:**
```bash
# Reset PostgreSQL password
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
\q

# Update .env with new password
```

**Port already in use:**
```bash
# Change PostgreSQL port
# Edit postgresql.conf: port = 5433

# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/todo_dev"
```

---

## Learning Outcomes

By completing this migration:
-  Database migration strategies (file-based � client-server)
-  Connection string management
-  Prisma cross-database compatibility
-  Why unit tests are DB-agnostic (mocking power)
-  Production database readiness
-  Docker multi-container preparation
