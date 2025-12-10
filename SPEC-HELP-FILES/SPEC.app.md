# Todo App - Learning Tutorial Specification

## Project Overview
A production-ready todo application built as a learning project using modern web technologies with separate backend and frontend.

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Modern web framework (upgraded from v4)
- **TypeScript** - Type safety
- **Prisma** - Modern ORM with type safety
- **SQLite** - Lightweight relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **crypto** - Token generation (Node.js built-in)
- **cors** - Cross-origin resource sharing
- **helmet** - Modern security headers (CSP, HSTS, etc.)
- **express-rate-limit** - Rate limiting for auth endpoints
- **joi** - Request validation with custom messages
- **dotenv** - Environment variables
- **isomorphic-dompurify** - XSS protection via input sanitization

### Frontend (Planned)
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **@tanstack/react-query** - Server state management
- **React Toastify** - Notifications

### Development & Testing
- **Nodemon** - Development server
- **Jest** + **ts-jest** - Unit testing framework
- **Supertest** - Integration/E2E testing (planned)
- **@types/jest** - TypeScript types for Jest
- **ESLint** + **Prettier** - Code quality (planned)
- **Husky** + **lint-staged** - Git hooks (planned)

### Production (Planned)
- **PM2** - Production process manager
- **Compression** - Response compression
- **Morgan** - HTTP request logging
- **Swagger** - API documentation

## Learning Path Structure

### Phase 1: Project Setup
1. Initialize project structure
2. Setup backend with Express + TypeScript
3. Setup frontend with Vite + React + TypeScript
4. Configure development environment

### Phase 2: Backend Development ([DONE])
1. Database setup with Prisma + SQLite
2. User authentication system (register, login)
3. Password reset flow (forgot password, reset password)
4. JWT implementation
5. Todo CRUD operations
6. MVC architecture (controllers, routers, middleware)
7. Centralized error handling with AppError class
8. Middleware setup (CORS, Helmet, Rate limiting, security)
9. Input validation with Joi (custom error messages)
10. Input sanitization with DOMPurify

### Phase 3: Frontend Development
1. React app structure
2. Routing setup
3. Authentication pages (Login/Register)
4. Todo management interface
5. Form handling and validation
6. State management with React Query
7. UI/UX with Material-UI

### Phase 4: Backend Testing ([DONE])
1. Unit tests for controllers (47 tests with Jest)
2. TDD approach (RED → GREEN → REFACTOR)
3. Mock all external dependencies (Prisma, bcrypt, JWT, crypto)
4. Security testing (XSS, CSRF, SQL injection protection)
5. Test coverage for validation, business logic, error handling
6. Integration tests (planned - with Supertest)

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
├── backend/                    # Node.js + Express 5 API
│   ├── src/
│   │   ├── controllers/        # Business logic (MVC Controller)
│   │   │   ├── auth.controller.ts      # register, login, forgotPassword, resetPassword
│   │   │   └── todos.controller.ts     # CRUD operations
│   │   ├── middleware/         # Cross-cutting concerns
│   │   │   ├── auth.ts                 # JWT authentication middleware
│   │   │   ├── security.ts             # Input sanitization, request size limits
│   │   │   └── errorHandler.ts         # AppError class, centralized error handler
│   │   ├── routers/           # Route definitions only (MVC View layer)
│   │   │   ├── auth.ts                 # Auth routes + rate limiting
│   │   │   └── todos.ts                # Todo routes
│   │   └── server.ts          # Application entry point
│   ├── prisma/                # Database layer
│   │   ├── schema.prisma      # User + Todo models (with password reset fields)
│   │   └── migrations/        # Database migrations
│   ├── tests/                 # Test suites
│   │   ├── unit/              # Unit tests (controllers - 47 tests)
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.test.ts
│   │   │   └── middleware/
│   │   │       ├── auth.test.ts
│   │   │       └── security.test.ts
│   │   └── tsconfig.json      # Test-specific TypeScript config
│   ├── jest.config.js         # Jest configuration
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + TypeScript SPA (Planned)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── SPEC-FILES/                # Documentation & guides
│   ├── TDD-GUIDE.md           # TDD best practices for unit testing
│   ├── SEC-GUIDE.md           # Security testing & implementation guide
│   └── TODO-APP-SPEC.md       # This file
└── README.md
```

### MVC Architecture Explanation:
- **Model**: Prisma schema and database operations (User, Todo)
- **View**: API routes (JSON responses, not HTML views)
- **Controller**: Business logic and request handling (throw AppError, no try-catch)
- **Middleware**: Cross-cutting concerns (auth, security, error handling)



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

**[DONE] Phase 1 Complete!**

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

**Security Note:** Never commit `.env` to version control. Add to `.gitignore`.

### Step 3: Create Basic Express Server
Create `src/server.ts` file with modern security setup:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

export { app };

// Start server only when running directly (not during testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

**Key Points:**
- Modern CSP configuration (no deprecated headers)
- Request size limits prevent DoS attacks
- Export app for testing
- Conditional server start (testing vs production)

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
  id                 String    @id @default(uuid())
  email              String    @unique
  password           String
  name               String?
  resetToken         String?   @unique      // Password reset token (hashed)
  resetTokenExpires  DateTime?              // Token expiry (1 hour)
  todos              Todo[]
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
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

**Key Fields:**
- `resetToken`: Stores hashed password reset token (never store plaintext)
- `resetTokenExpires`: 1-hour expiry for security
- `onDelete: Cascade`: Automatically delete user's todos when user is deleted

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

**[DONE] Phase 2 Basic Setup Complete!**

### Step 8: Create Error Handling Middleware
Create `src/middleware/errorHandler.ts` for centralized error handling:

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error('Error:', { statusCode, message, stack: err.stack });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

**Benefits:**
- No try-catch in controllers (cleaner code)
- Consistent error responses
- Centralized error logging
- Development-only stack traces

### Step 9: Create Authentication Middleware
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

### Step 10: Create Authentication Controller (MVC Pattern)
Create `src/controllers/auth.controller.ts`:

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AppError } from '../middleware/errorHandler';
import * as crypto from 'crypto';

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

// Helper: Generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Register
export const register = async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) throw new AppError(400, error.details[0].message);

  const { email, password, name } = value;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError(400, 'User already exists with this email');

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true, createdAt: true }
  });

  const token = generateToken(user.id);
  res.status(201).json({ message: 'User registered successfully', user, token });
};

// Login
export const login = async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) throw new AppError(400, error.details[0].message);

  const { email, password } = value;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(400, 'Invalid email or password');

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new AppError(400, 'Invalid email or password');

  const token = generateToken(user.id);
  res.json({
    message: 'Login successful',
    user: { id: user.id, email: user.email, name: user.name },
    token
  });
};

// Forgot Password & Reset Password omitted for brevity
// See actual implementation in backend/src/controllers/auth.controller.ts
```

**Key Patterns:**
- Throw `AppError` instead of try-catch (errorHandler middleware catches)
- Joi validation with custom error messages
- bcrypt for password hashing (12 salt rounds)
- JWT token generation helper
- Prisma for database operations

### Step 11: Create Authentication Routes
Create `src/routers/auth.ts` file:

```typescript
import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = express.Router();

// Rate limiter for password reset (prevent spam/brute force)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many password reset attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
```

**Key Points:**
- Clean route definitions (no business logic)
- Rate limiting on sensitive endpoints (forgot-password)
- MVC separation: routes handle HTTP, controllers handle business logic

### Step 12: Update Server with Routes and Error Handler
Update `src/server.ts` to wire everything together:

```typescript
// Import routes
import authRoutes from './routers/auth';
import todoRoutes from './routers/todos';

// Import middleware
import { sanitizeInput, limitRequestSize } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

// ... existing security setup ...

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error handler middleware (MUST be last!)
app.use(errorHandler);

export { app };
```

**Critical:** Error handler must be registered AFTER all routes.

**[DONE] Phase 2 Backend Complete!**

---

## Phase 3: Testing Implementation

### Testing Strategy

**Two Testing Approaches:**
1. **Unit Tests** - Test controllers in isolation with mocked dependencies ([DONE])
2. **Integration Tests** - Test full HTTP endpoints with real database (Planned)

**Current Implementation:**
- 47 unit tests for authentication controllers
- TDD approach: RED → GREEN → REFACTOR
- All external dependencies mocked (Prisma, bcrypt, JWT, crypto)
- See `SPEC-FILES/TDD-GUIDE.md` for detailed patterns

### Step 1: Install Testing Dependencies

```bash
cd backend
npm install -D jest @types/jest ts-jest
```

**Note:** Supertest for integration tests is planned but not yet implemented.

### Step 2: Configure Jest
Create `jest.config.js`:

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
  ]
};
```

### Step 3: Create Unit Tests
Example test structure (see TDD-GUIDE.md for full patterns):

```typescript
// tests/unit/controllers/auth.controller.test.ts
import { Request, Response } from 'express';
import { register, login } from '../../../src/controllers/auth.controller';

// Mock external dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('should register new user successfully', async () => {
      // ARRANGE - Setup mocks
      // ACT - Call controller
      // ASSERT - Verify behavior
    });

    it('should reject duplicate email', async () => {
      // Test validation
    });
  });
});
```

**Key Patterns:**
- Mock all external dependencies (Prisma, bcrypt, JWT, crypto)
- Use AAA pattern (Arrange, Act, Assert)
- Test happy path + validation + error handling
- See `SPEC-FILES/TDD-GUIDE.md` for complete examples

### Step 4: Integration Tests (Planned)
Integration tests with Supertest for end-to-end API testing:

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

**Note:** Integration tests not yet implemented. Focus is on unit tests with TDD approach.

### Step 5: Update Package.json Scripts
Add test scripts to `backend/package.json`:

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

### Step 6: Run Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**[DONE] Phase 3 Testing Complete!**

---

## Phase 4: Security Implementation

### Security Measures Implemented

**Authentication & Authorization:**
- JWT tokens with expiration
- bcrypt password hashing (12 salt rounds)
- Password reset flow with hashed tokens (1-hour expiry)
- Authentication middleware for protected routes

**Input Security:**
- Joi validation with custom error messages
- DOMPurify input sanitization (XSS protection)
- Request size limits (1MB max)
- SQL injection protection via Prisma ORM

**HTTP Security:**
- Modern Helmet configuration with CSP
- CORS enabled
- Rate limiting (global + password reset endpoint)
- Secure headers (no deprecated X-XSS-Protection)

**Security Testing:**
- Unit tests verify token hashing
- User enumeration prevention tested
- Validation error handling tested

**See** `SPEC-FILES/SEC-GUIDE.md` for comprehensive security documentation.

**[DONE] Phase 4 Security Complete!**

---

## Next Steps (Frontend & Deployment)

### Phase 5: Frontend Development (Planned)
- React + TypeScript + Vite setup
- Material-UI components
- React Router for navigation
- React Query for server state
- Authentication flow (login/register/logout)
- Todo management interface
- Form validation with React Hook Form

### Phase 6: Integration (Planned)
- Connect frontend to backend API
- Axios HTTP client setup
- Token management
- Error handling & loading states
- Toast notifications

### Phase 7: Production (Planned)
- Environment configuration (dev/prod)
- Docker containerization
- CI/CD pipeline
- Deployment (Vercel/Railway/AWS)
- Monitoring & logging
- Performance optimization

---

## References

**Documentation:**
- `SPEC-FILES/TDD-GUIDE.md` - Unit testing patterns and best practices
- `SPEC-FILES/SEC-GUIDE.md` - Security implementation and testing

**Key Files:**
- `backend/src/server.ts` - Application entry point
- `backend/src/middleware/errorHandler.ts` - AppError class and centralized error handling
- `backend/src/controllers/auth.controller.ts` - Authentication business logic
- `backend/src/routers/auth.ts` - Authentication routes
- `backend/tests/unit/controllers/auth.controller.test.ts` - 47 unit tests
- `backend/prisma/schema.prisma` - Database schema

**Testing:**
- 47 unit tests (auth controllers)
- TDD approach (RED → GREEN → REFACTOR)
- Mock external dependencies (Prisma, bcrypt, JWT, crypto)

**Technologies:**
- Express 5, TypeScript, Prisma, SQLite
- Jest, bcrypt, JWT, Joi, Helmet
- Modern security patterns (no deprecated headers)

