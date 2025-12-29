# Database Management Guide

## Quick Start (Follow-Up Dev Sessions)

**Use this when continuing work on already-setup project.**

### Start Everything (DB + Backend)
```bash
# Start both services
docker-compose up -d

# Check status
docker ps

# View logs
docker-compose logs -f backend

# Test backend
curl http://localhost:5000/health
```

### Start Step-by-Step (Learning)
```bash
# Start database first
docker-compose up -d postgres

# Verify postgres is healthy
docker ps

# Start backend (waits for postgres health)
docker-compose up -d backend

# Follow logs
docker-compose logs -f backend
```

### Stop Services
```bash
# Stop everything (keeps volumes/data)
docker-compose down

# Stop specific service
docker-compose stop postgres
docker-compose stop backend

# Start again
docker-compose up -d
```

### Rebuild After Code Changes
```bash
# Rebuild and restart backend
docker-compose up -d --build backend

# View logs for errors
docker-compose logs -f backend
```

**What Happens on Startup:**
1. Postgres starts → healthcheck runs (10s intervals)
2. Backend waits for postgres healthy status
3. Migrations run automatically (`npx prisma migrate deploy`)
4. Server starts on port 5000

---

## Initial Setup (Creating From Scratch)

**Use this for first-time setup or understanding the manual migration process.**

### SQLite → PostgreSQL Migration

### 1. Start PostgreSQL (Docker)
```powershell
docker run --name todo-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=todo_dev -p 5432:5432 -d postgres:15
```

### 2. Update Prisma Schema
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Was: "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Update Connection String
```env
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_dev"
# Was: "file:./dev.db"
```

### 4. Delete Old Migrations
```powershell
Remove-Item -Recurse -Force prisma\migrations
```

### 5. Run Migration
```powershell
npx prisma migrate dev --name switch_to_postgresql
```

### 6. Verify
```powershell
npm test  # All tests should pass (mocked, DB-agnostic)
```

---

## Common Docker Commands

### With Docker Compose (Current Setup - Preferred)
```bash
# Start/stop services
docker-compose up -d              # Start everything
docker-compose up -d postgres     # Start postgres only
docker-compose up -d backend      # Start backend only
docker-compose stop postgres      # Stop postgres
docker-compose down               # Stop everything

# View logs
docker-compose logs -f backend    # Follow backend logs
docker-compose logs postgres      # View postgres logs

# Rebuild after code changes
docker-compose up -d --build backend

# Check status
docker ps
```

### Manual Docker Commands (Also Work)
```bash
# Direct container control (works but less preferred)
docker stop todo-postgres         # Stop postgres container
docker start todo-postgres        # Start postgres container
docker rm todo-postgres           # Remove container

# Database access (works with both setups)
docker exec -it todo-postgres psql -U postgres -d todo_dev

# Exit psql
\q
```

**Rule:** Prefer `docker-compose` commands when `docker-compose.yml` exists. Direct `docker` commands work but don't manage dependencies/networks.

---

## Checking Database Contents

### Option 1: psql (CLI)

```powershell
# Connect to database
docker exec -it todo-postgres psql -U postgres -d todo_dev
```

**psql commands (start with `\`, no semicolon):**
```sql
\dt              -- List all tables
\d "User"        -- Describe User table structure
\d "Todo"        -- Describe Todo table structure
\q               -- Exit psql
```

**SQL queries (end with `;`):**
```sql
SELECT * FROM "User";                    -- View all users
SELECT * FROM "Todo";                    -- View all todos
SELECT COUNT(*) FROM "User";             -- Count users
SELECT email, name FROM "User";          -- Specific columns
SELECT * FROM "Todo" WHERE completed = true;  -- Filter todos
```

---

### Option 2: Prisma Studio (GUI - Easiest)

```powershell
npx prisma studio
```

- Opens browser at `http://localhost:5555`
- Visual database explorer
- Click tables to view/edit data
- No SQL knowledge needed

---

### Option 3: Test API + Check Data

```powershell
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"

# 2. Check database
docker exec -it todo-postgres psql -U postgres -d todo_dev

# 3. In psql, view user
SELECT email, name FROM "User";
\q
```

---

## Command Breakdown: `docker exec -it todo-postgres psql -U postgres -d todo_dev`

| Part | Meaning |
|------|---------|
| `docker exec` | Run command inside running container |
| `-it` | Interactive terminal (allows typing commands) |
| `todo-postgres` | Container name |
| `psql` | PostgreSQL command-line tool |
| `-U postgres` | Login as user "postgres" |
| `-d todo_dev` | Connect to database "todo_dev" |

**Breakdown:**
- **`docker exec`** - Execute a command in a running container
- **`-i`** - Keep STDIN open (interactive)
- **`-t`** - Allocate pseudo-TTY (terminal)
- **`todo-postgres`** - Name of the container (set with `--name` when created)
- **`psql`** - PostgreSQL interactive terminal program (inside container)
- **`-U postgres`** - Username flag (default superuser)
- **`-d todo_dev`** - Database name flag (created with `-e POSTGRES_DB=todo_dev`)

**Think of it like:**
- "Docker, go inside the `todo-postgres` container"
- "Open an interactive terminal"
- "Run the `psql` program"
- "Log in as user `postgres`"
- "Connect to database `todo_dev`"

**Why each flag:**
- **`-it`** - Without this, you can't type commands (non-interactive)
- **`-U postgres`** - Default admin user created by PostgreSQL image
- **`-d todo_dev`** - Specifies which database (container can have multiple databases)

---

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Development (Local backend, Docker DB):**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_dev"
```
- Backend runs on host machine
- Connects to Docker container via `localhost:5432`

**Production (Docker Compose - Both containerized):**
```
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/todo_dev"
```
- Backend runs in Docker container
- Connects via service name `postgres` (Docker internal networking)
- Defined in `docker-compose.yml`

---

## Why PostgreSQL Over SQLite

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Concurrency** | Single writer | Multiple writers |
| **Production** | No (file-based) | Yes (client-server) |
| **Docker** | No (shared file) | Yes (container) |
| **Data Types** | Limited (5) | Rich (many) |

---

## Troubleshooting

**Error: Docker not running**
```bash
# Start Docker Desktop, wait 30 seconds
docker ps  # Verify Docker is responding
```

**Error: Port 5432 or 5000 already in use**
```bash
docker ps -a                      # Check existing containers
docker-compose down               # Stop all services
docker stop todo-postgres         # Or stop specific container
```

**Error: Backend can't connect to database**
```bash
# 1. Check postgres is healthy
docker ps  # Look for "healthy" status

# 2. Check backend logs
docker-compose logs backend

# 3. Verify connection string in docker-compose.yml
# Should be: postgresql://postgres:postgres@postgres:5432/todo_dev
```

**Error: Provider mismatch (P3019)**
```bash
# Delete migrations and recreate
Remove-Item -Recurse -Force prisma\migrations
npx prisma migrate dev --name init
```

**Error: Migrations not running in container**
```bash
# Check backend startup logs
docker-compose logs backend

# Manually run migrations
docker-compose exec backend npx prisma migrate deploy
```

**Error: Container won't start (crash loop)**
```bash
# View error logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose up -d --build backend
```

---

## Prisma Commands

```powershell
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

---

## Key Learnings

- **Docker DB = Development convenience** - No native install needed
- **Migration lock file** - Tracks which database provider you're using
- **Unit tests are DB-agnostic** - Fully mocked, pass regardless of database
- **Connection string changes** - `localhost` (dev) vs container name (production)
- **Prisma handles SQL dialects** - Same schema works for SQLite/PostgreSQL/MySQL
