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

## Project Structure
```
todo-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
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

### Step 6: Create Backend Source Structure
Create the folder structure inside backend:
```bash
mkdir src src/controllers src/middleware src/models src/routes src/utils tests
```

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

// Security middleware
app.use(helmet());
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

### Step 9: Create Authentication Routes
Create `src/routes/auth.ts` file:

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

// Security middleware
app.use(helmet());
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

**Complete Step 8 (create auth middleware) and let me know when ready for the next step!**







