# Database Management Guide

## SQLite � PostgreSQL Migration

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

```powershell
# Check running containers
docker ps

# Stop PostgreSQL
docker stop todo-postgres

# Start PostgreSQL
docker start todo-postgres

# Remove container
docker rm todo-postgres

# Connect to database
docker exec -it todo-postgres psql -U postgres -d todo_dev

# Exit psql
\q
```

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

**Development (Docker):** `postgresql://postgres:postgres@localhost:5432/todo_dev`

**Production (Container):** `postgresql://postgres:postgres@postgres:5432/todo_dev`
- `postgres` (host) = container name in docker-compose

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
```
Start Docker Desktop, wait 30 seconds
```

**Error: Port 5432 already in use**
```powershell
docker ps  # Check if container already running
docker stop todo-postgres
```

**Error: Provider mismatch (P3019)**
```powershell
Remove-Item -Recurse -Force prisma\migrations
npx prisma migrate dev --name init
```

**Error: Can't connect to database**
```powershell
docker ps  # Verify container running
# Check DATABASE_URL in .env matches container
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
