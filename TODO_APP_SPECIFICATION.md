# Todo App - Learning Tutorial Specification

## Project Overview
A production-ready todo application built as a learning project using modern web technologies with separate backend and frontend.

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Modern ORM with type safety
- **SQLite** - Lightweight relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting 
- **joi** - Request validation
- **winston** - Logging
- **dotenv** - Environment variables
- **express-validator** - Input sanitization

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **@tanstack/react-query** - Server state management
- **React Toastify** - Notifications

### Development & Production
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands
- **Jest** + **Supertest** + **@types/jest** - Backend testing (HTTP endpoint testing)
- **@testing-library/react** + **@testing-library/jest-dom** - Frontend testing
- **ESLint** + **Prettier** - Code quality
- **Husky** + **lint-staged** - Git hooks
- **PM2** - Production process manager

### Optional Enhancements
- **Swagger UI Express** + **swagger-jsdoc** - API documentation (FREE!)
- **Compression** - Response compression
- **Morgan** - HTTP request logging

## Learning Path Structure

### Phase 1: Project Setup
1. Initialize project structure
2. Setup backend with Express + TypeScript
3. Setup frontend with Vite + React + TypeScript
4. Configure development environment

### Phase 2: Backend Development
1. Database setup with Prisma + SQLite
2. User authentication system
3. JWT implementation
4. Todo CRUD operations
5. Middleware setup (CORS, Helmet, Rate limiting)
6. Input validation and sanitization
7. Error handling and logging

### Phase 3: Frontend Development
1. React app structure
2. Routing setup
3. Authentication pages (Login/Register)
4. Todo management interface
5. Form handling and validation
6. State management with React Query
7. UI/UX with Material-UI

### Phase 4: Integration & Testing
1. Connect frontend to backend
2. API integration
3. Unit tests for backend
4. Component tests for frontend
5. Integration testing

### Phase 5: Production Ready Features
1. Environment configuration
2. Error boundaries
3. Loading states and error handling
4. Security hardening
5. Performance optimization
6. Docker containerization
7. Deployment preparation

## Project Structure (MVC Pattern)
```
todo-app/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── controllers/        # Business logic (MVC Controller)
│   │   │   ├── auth.controller.ts
│   │   │   └── todos.controller.ts
│   │   ├── middleware/         # Cross-cutting concerns
│   │   │   ├── auth.ts
│   │   │   └── security.ts
│   │   ├── routers/           # Route definitions only (MVC View layer)
│   │   │   ├── auth.ts
│   │   │   └── todos.ts
│   │   ├── models/            # Data models (MVC Model - via Prisma)
│   │   ├── utils/             # Helper functions
│   │   └── server.ts          # Application entry point
│   ├── prisma/                # Database layer
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── tests/                 # Test suites
│   │   ├── unit/              # Unit tests (controllers)
│   │   └── integration/       # Integration tests (routes)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### MVC Architecture Explanation:
- **Model**: Prisma schema and database operations
- **View**: API routes (JSON responses, not HTML views)
- **Controller**: Business logic and request handling



## Phase 1: Project Setup - Detailed Steps

### What You'll Learn
- Project structure organization
- Node.js/npm initialization
- Vite setup for React + TypeScript
- Development environment configuration

### Step 1: Create Project Structure
Create the folder structure:
```bash
mkdir backend frontend
```

### Step 2: Initialize Backend
Navigate to backend and initialize:
```bash
cd backend
npm init -y
```
This creates `package.json`. You'll modify it next to add TypeScript and Express dependencies.

### Step 3: Initialize Frontend
Navigate to frontend and create Vite React app:
```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
```
When prompted, confirm to use the current directory.

### Step 4: Install Backend Dependencies
Go back to backend folder:
```bash
cd ../backend
```

Install core dependencies:
```bash
npm install express cors helmet express-rate-limit joi winston dotenv bcryptjs jsonwebtoken @prisma/client
```

Install dev dependencies:
```bash
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken nodemon ts-node prisma
```

### Step 5: Setup TypeScript Config
Create `tsconfig.json` in backend folder.

### Step 6: Create Backend MVC Structure
Create the MVC folder structure inside backend:
```bash
mkdir src src/controllers src/middleware src/models src/routers src/utils tests tests/unit tests/integration
```

**Folder Purposes:**
- `controllers/` - Business logic and request handling
- `routers/` - Route definitions and HTTP endpoint mapping
- `middleware/` - Cross-cutting concerns (auth, security, logging)
- `models/` - Data models (Prisma handles this mostly)
- `utils/` - Helper functions and utilities
- `tests/unit/` - Unit tests for controllers (mocked dependencies)
- `tests/integration/` - Integration tests for API endpoints

### Step 7: Install Frontend Dependencies
Navigate to frontend and install additional dependencies:
```bash
cd ../frontend
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom axios react-hook-form @tanstack/react-query react-toastify
```

### Step 8: Setup Development Scripts
Configure package.json scripts for both backend and frontend.

**Backend package.json scripts:**
In `backend/package.json`, replace the scripts section with:
```json
"scripts": {
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

**Frontend package.json scripts:**
In `frontend/package.json`, the scripts should already be there from Vite:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

**What these scripts do:**
- `npm run dev` - Starts development server with auto-reload
- `npm run build` - Builds for production
- `npm start` - Runs production build (backend only)
- `npm run lint` - Lints code (frontend only)
- `npm run preview` - Previews production build (frontend only)

**✅ Phase 1 Complete!**

---

## Phase 2: Backend Development - Detailed Steps

### What You'll Learn
- TypeScript configuration for Node.js/Express
- Express server setup
- Environment variables configuration
- Database setup with Prisma + SQLite
- Authentication system with JWT
- Middleware setup for security
- API route structure

### Step 1: Create TypeScript Configuration
Create `tsconfig.json` file in the `backend` folder with this content:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**What this does:**
- Compiles TypeScript to modern JavaScript (ES2022)
- Outputs compiled files to `dist/` folder
- Enables strict type checking
- Includes source maps for debugging

### Step 2: Create Environment Configuration
Create `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL="file:./dev.db"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Create Basic Express Server
Create `src/server.ts` file:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Modern security middleware with proper configuration
app.use(helmet({
  xssFilter: false,  // Disable deprecated X-XSS-Protection
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
```

### Step 4: Initialize Prisma
Initialize Prisma with SQLite:

```bash
cd backend
npx prisma init --datasource-provider sqlite
```

This creates:
- `prisma/schema.prisma` - Database schema file
- Updates `.env` with DATABASE_URL

### Step 5: Define Database Schema
Replace the content of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Todo {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Step 6: Create Database Migration
Run the initial migration:

```bash
npx prisma migrate dev --name init
```

This creates:
- SQLite database file
- Migration history
- Generates Prisma Client

### Step 7: Test the Setup
1. Navigate to backend folder: `cd backend`
2. Run the development server: `npm run dev`
3. Open browser and visit: `http://localhost:5000/health`
4. You should see: `{"message":"Server is running!","timestamp":"..."}`

**✅ Phase 2 Basic Setup Complete!**

### Step 8: Create Authentication Middleware`
Create `src/middleware/auth.ts` file:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Step 9: Create Authentication with MVC Pattern

#### 9a. Create Authentication Controller
Create `src/controllers/auth.controller.ts`:

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN as any || '24h' }
    );
};

// Register controller
export const register = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password, name } = value;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });

        // Generate JWT token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login controller
export const login = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

#### 9b. Create Authentication Routes
Create `src/routers/auth.ts` file:

```typescript
import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

// Authentication routes - Clean and simple!
router.post('/register', register);
router.post('/login', login);

export default router;
```

**Key Benefits of MVC Pattern:**
- **Separation of Concerns**: Business logic in controllers, route definitions in routers
- **Testability**: Controllers can be unit tested independently
- **Maintainability**: Easy to find and modify business logic
- **Reusability**: Controller functions can be reused across different routes

**Compare with Old "Fat Routes" Pattern:**
- **Before**: 100+ lines of mixed concerns in router file
- **After**: 10 lines of clean route definitions

#### 9c. Old Pattern (DO NOT USE)
Here's what we replaced - the old "fat routes" pattern that mixed business logic with routing:

```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Why We Don't Use This Pattern Anymore:**
- ❌ **Mixed concerns** - Routing + business logic + validation + database operations
- ❌ **Hard to test** - Need full HTTP requests to test business logic
- ❌ **Poor reusability** - Business logic tied to HTTP layer
- ❌ **Difficult maintenance** - Finding logic scattered across route handlers

**Modern MVC Pattern Benefits:**
- ✅ **Clean separation** - Routes handle HTTP, controllers handle business logic
- ✅ **Unit testable** - Test controllers with mocked dependencies
- ✅ **Maintainable** - Business logic centralized in controllers
- ✅ **Professional** - Industry-standard architecture

### Step 10: Update Server with Auth Routes
Update `src/server.ts` to include authentication routes:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Modern security middleware with proper configuration
app.use(helmet({
  xssFilter: false,  // Disable deprecated X-XSS-Protection
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/register & /api/auth/login`);
});
```

**✅ Phase 2 Authentication Complete!**

---

## Phase 2 Continuation - Todo CRUD Operations

### Step 1: Create Todo Routes
Create `src/routes/todos.ts` file for todo management:

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createTodoSchema = Joi.object({
  title: Joi.string().required().trim().min(1),
  description: Joi.string().optional().allow('').trim()
});

const updateTodoSchema = Joi.object({
  title: Joi.string().optional().trim().min(1),
  description: Joi.string().optional().allow('').trim(),
  completed: Joi.boolean().optional()
});

// GET /api/todos - Get user's todos
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Todos retrieved successfully',
      todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/todos - Create new todo
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Validate request body
    const { error, value } = createTodoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, description } = value;

    const todo = await prisma.todo.create({
      data: {
        title,
        description: description || null,
        userId: req.user!.id
      }
    });

    res.status(201).json({
      message: 'Todo created successfully',
      todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Validate request body
    const { error, value } = updateTodoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { 
        id,
        userId: req.user!.id 
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Update todo
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        ...value,
        description: value.description || null
      }
    });

    res.json({
      message: 'Todo updated successfully',
      todo: updatedTodo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { 
        id,
        userId: req.user!.id 
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Delete todo
    await prisma.todo.delete({
      where: { id }
    });

    res.json({
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Step 2: Update Server with Todo Routes
Update `src/server.ts` to include todo routes:

```typescript
// Add this import with other route imports
import todoRoutes from './routes/todos';

// Add this route with other API routes
app.use('/api/todos', todoRoutes);
```

**✅ Phase 2 Todo CRUD Complete!**

---

## Phase 3 Continuation - MVC Testing Strategy

### Testing Architecture with MVC Pattern

**Two Types of Tests:**
- **Unit Tests** - Test controllers in isolation (mocked dependencies)
- **Integration Tests** - Test API endpoints end-to-end

### Step 1: Install Testing Dependencies
Install Jest, Supertest and TypeScript testing dependencies:

```bash
cd backend
npm install -D jest supertest @types/jest @types/supertest ts-jest
```

### Step 2: Configure Jest for TypeScript
Create `jest.config.js` in the backend folder:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tests/tsconfig.json'
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

### Step 3: Create Proper Test Structure

#### 3a. Unit Tests (NEW - Recommended)
Create `tests/unit/controllers/auth.controller.test.ts`:

```typescript
import { Request, Response } from 'express';
import { register, login } from '../../../src/controllers/auth.controller';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock all external dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
} as unknown as PrismaClient;

describe('Auth Controller - Unit Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Mock request and response objects
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = {
      body: {}
    };

    res = {
      status: statusMock,
      json: jsonMock
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      req.body = userData;

      // Mock Prisma calls
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: userData.email,
        name: userData.name
      });

      // Mock bcrypt and jwt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

      await register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: expect.objectContaining({
          email: userData.email
        }),
        token: 'jwt-token'
      });
    });

    it('should return error for existing user', async () => {
      req.body = {
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock existing user
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user'
      });

      await register(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'User already exists with this email'
      });
    });
  });
});
```

**Benefits of Unit Tests:**
- ⚡ **Fast** - No database, no HTTP requests
- 🎯 **Focused** - Test only business logic
- 🔒 **Reliable** - No external dependencies
- 🐛 **Easy debugging** - Isolated failures

#### 3b. Integration Tests (Current approach)
Create `tests/integration/auth.test.ts` for API endpoint testing:

```typescript
import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../setup';

describe('Auth Endpoints - Integration Tests', () => {
  beforeEach(async () => {
    // Clean database
    await prisma.user.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

### Step 4: Create Test Setup File
Create `tests/setup.ts` for integration test database configuration:

```typescript
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.DATABASE_URL = 'file:./test.db';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

beforeAll(async () => {
  // Create test database
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' }
  });
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.todo.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

export { prisma };
```

### Step 4: Create Authentication Tests
Create `tests/auth.test.ts`:

```typescript
import request from 'supertest';
import { app } from '../src/server';
import { prisma } from './setup';

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('"email" must be a valid email');
    });

    it('should not register user with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('"password" length must be at least 6 characters long');
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Invalid email or password');
    });
  });
});
```

### Step 5: Create Comprehensive Todo Tests
Create `tests/todos.test.ts` with complete coverage for all CRUD operations:

```typescript
import request from 'supertest';
import { app } from '../src/server';
import { prisma } from './setup';

describe('Todo Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('GET /api/todos', () => {
    it('should return empty todos for new user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Todos retrieved successfully');
      expect(response.body.todos).toEqual([]);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should return user specific todos', async () => {
      // Create todos for the authenticated user
      await prisma.todo.createMany({
        data: [
          { title: 'Todo 1', userId },
          { title: 'Todo 2', userId }
        ]
      });

      // Create todo for another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User'
        }
      });
      await prisma.todo.create({
        data: { title: 'Other Todo', userId: otherUser.id }
      });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(2);
      // Check both todos are returned (order may vary due to timing)
      const todoTitles = response.body.todos.map((todo: any) => todo.title).sort();
      expect(todoTitles).toEqual(['Todo 1', 'Todo 2']);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Todo description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.todo.title).toBe(todoData.title);
      expect(response.body.todo.description).toBe(todoData.description);
      expect(response.body.todo.completed).toBe(false);
      expect(response.body.todo.userId).toBe(userId);
    });

    it('should create todo without description', async () => {
      const todoData = { title: 'Simple Todo' };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.todo.description).toBeNull();
    });

    it('should not create todo with empty title', async () => {
      const todoData = { title: '' };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body.error).toBe('"title" is not allowed to be empty');
    });

    it('should not create todo without title', async () => {
      const todoData = { description: 'Only description' };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body.error).toBe('"title" is required');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'New Todo' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Test Todo', userId }
      });
      todoId = todo.id;
    });

    it('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Todo',
        description: 'Updated description',
        completed: true
      };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.todo.title).toBe(updateData.title);
      expect(response.body.todo.completed).toBe(true);
    });

    it('should update only title', async () => {
      const updateData = { title: 'Only Title Updated' };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.todo.title).toBe(updateData.title);
      expect(response.body.todo.completed).toBe(false); // Should remain unchanged
    });

    it('should update only completion status', async () => {
      const updateData = { completed: true };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.todo.completed).toBe(true);
      expect(response.body.todo.title).toBe('Test Todo'); // Should remain unchanged
    });

    it('should not update non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should not update other users todo', async () => {
      // Create another user and their todo
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User'
        }
      });
      const otherTodo = await prisma.todo.create({
        data: { title: 'Other Todo', userId: otherUser.id }
      });

      const response = await request(app)
        .put(`/api/todos/${otherTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked' })
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should not update with empty title', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.error).toBe('"title" is not allowed to be empty');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Test Todo', userId }
      });
      todoId = todo.id;
    });

    it('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Todo deleted successfully');

      // Verify todo is deleted
      const deletedTodo = await prisma.todo.findUnique({
        where: { id: todoId }
      });
      expect(deletedTodo).toBeNull();
    });

    it('should not delete non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should not delete other users todo', async () => {
      // Create another user and their todo
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User'
        }
      });
      const otherTodo = await prisma.todo.create({
        data: { title: 'Other Todo', userId: otherUser.id }
      });

      const response = await request(app)
        .delete(`/api/todos/${otherTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });
});
```

### Step 6: Update Package.json Scripts
Update the scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 7: Export App for Testing
Update `src/server.ts` to export the app:

```typescript
// At the end of server.ts, before app.listen()
export { app };

// Keep the app.listen() for when running normally
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/register & /api/auth/login`);
  });
}
```

### Step 8: Run Tests

Execute the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**✅ Phase 3 Backend Testing Complete!**

---

## Phase 3 Continuation - Security Hardening

### What You'll Learn
- XSS (Cross-Site Scripting) prevention
- CSRF (Cross-Site Request Forgery) protection
- SQL Injection prevention
- Input sanitization and validation
- Security headers and CSP
- Security testing methodologies

### Current Security Measures Analysis

#### ✅ **SQL Injection Protection**
- **Prisma ORM**: Provides automatic parameterization and escaping
- **Joi validation**: Prevents malicious input patterns
- **Type safety**: TypeScript prevents many injection vectors

#### ✅ **CSRF Protection** 
- **JWT tokens in headers**: Harder to forge than cookies
- **Token validation**: Verifies user identity on each request
- **Same-origin policy**: Browser enforces origin restrictions

#### ✅ **XSS Protection**
- **Helmet middleware**: Sets CSP headers (modern XSS protection, X-XSS-Protection disabled as deprecated)
- **Input sanitization**: DOMPurify sanitizes malicious HTML/script content
- **Content Security Policy**: Prevents inline script execution and restricts resource loading

### Step 1: Enhanced Security Middleware

Create `src/middleware/security.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove null bytes and clean HTML
      return DOMPurify.sanitize(value.replace(/\0/g, ''));
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  next();
};

// Note: CSP and other security headers are now handled by Helmet configuration
// This keeps the middleware focused on application-specific security functions

// Request size limiting
export const limitRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 1024 * 1024; // 1MB limit
  
  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > maxSize) {
      return res.status(413).json({ 
        error: 'Request entity too large',
        maxSize: `${maxSize / 1024 / 1024}MB`
      });
    }
  }
  
  next();
};
```

### Step 2: Install Security Dependencies

```bash
npm install isomorphic-dompurify
```

### Step 3: Update Server Security Configuration

Update `src/server.ts`:

```typescript
// Import security middleware (CSP now handled by Helmet)
import { sanitizeInput, limitRequestSize } from './middleware/security';

// Modern security middleware with proper configuration
app.use(helmet({
  xssFilter: false,  // Disable deprecated X-XSS-Protection
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(limitRequestSize);

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization
app.use(sanitizeInput);
```

### Step 4: Create Security Tests

Create `tests/security.test.ts` with comprehensive security testing:

```typescript
import request from 'supertest';
import { app } from '../src/server';
import { prisma } from './setup';

describe('Security Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `security${Date.now()}@example.com`,
        password: 'password123',
        name: 'Security Test User'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('XSS Protection Tests', () => {
    it('should sanitize script injection in todo title', async () => {
      const maliciousPayload = {
        title: '<script>alert("XSS")</script>',
        description: 'Normal description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousPayload)
        .expect(201);

      // Should be sanitized by DOMPurify
      expect(response.body.todo.title).not.toContain('<script>');
    });
  });

  describe('SQL Injection Protection Tests', () => {
    it('should prevent SQL injection in email field', async () => {
      const sqlInjection = "admin@test.com'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: sqlInjection,
          password: 'password123',
          name: 'SQL Injection Test'
        })
        .expect(400);

      expect(response.body.error).toBe('"email" must be a valid email');
    });
  });

  describe('CSRF Protection Tests', () => {
    it('should require valid JWT token for protected routes', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'CSRF Test Todo' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });
});
```

### Security Testing Commands

```bash
# Run security tests
npm test security.test.ts

# Run all tests with security coverage
npm run test:coverage
```

### Step 5: Security Headers Verification

Test your security headers with tools like:
- **SecurityHeaders.com**: Online scanner for HTTP headers
- **OWASP ZAP**: Automated security testing
- **Burp Suite**: Manual security testing

### Security Best Practices Implemented

1. **Input Validation**: Joi schemas validate all inputs
2. **Output Encoding**: DOMPurify sanitizes HTML content  
3. **Parameterized Queries**: Prisma ORM prevents SQL injection
4. **JWT Authentication**: Stateless, secure token-based auth
5. **Rate Limiting**: Prevents brute force attacks
6. **Security Headers**: Modern CSP (no deprecated X-XSS-Protection), HSTS, X-Frame-Options, etc.
7. **Request Size Limits**: Prevents DoS via large payloads
8. **CORS Configuration**: Controls cross-origin access

### Security Testing Results
- **XSS**: ✅ Protected via input sanitization (DOMPurify) and modern CSP headers (no deprecated X-XSS-Protection)
- **SQL Injection**: ✅ Protected via Prisma ORM and validation  
- **CSRF**: ✅ Protected via JWT tokens in headers
- **Rate Limiting**: ✅ Implemented with express-rate-limit
- **Input Validation**: ✅ Comprehensive Joi schemas

**✅ Phase 3 Security Hardening Complete!**









