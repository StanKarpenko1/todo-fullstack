# Frontend Development Plan

## Overview

**Goal:** Build production-ready React frontend with clean architecture and comprehensive test coverage.

**Key Principles:**
1. **Separation of concerns** - Components, hooks, API calls in separate files
2. **Feature isolation** - Each feature is self-contained (auth, todos)
3. **No mixing layers** - UI components don't make API calls directly
4. **Tests colocated** - `__tests__/` folders next to features
5. **Simple > Complex** - Avoid over-engineering, build only what's needed

**Features:**
- Authentication (login, register, forgot password, auth guards)
- Todo management (CRUD operations, filters, completion toggle)
- Protected routes
- Responsive UI with MUI

---

## Setup

### 1. Create Vite Project

```bash
# Create React + TypeScript project with Vite
npm create vite@latest frontend -- --template react-ts

cd frontend
```

### 2. Install Core Dependencies

```bash
# UI Framework
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Routing
npm install react-router-dom

# HTTP Client
npm install axios

# Server State Management
npm install @tanstack/react-query

# Form Handling & Validation
npm install react-hook-form zod @hookform/resolvers

# Notifications
npm install react-toastify
```

### 3. Install Dev Dependencies

```bash
# Testing
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom

# Type Definitions
npm install -D @types/node
```

### 4. Configure Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 5. Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@pages/*": ["./src/pages/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 6. Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Project Structure

```
frontend/
├── src/
│   ├── features/                    # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/          # UI components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   ├── hooks/               # Business logic + API integration
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useRegister.ts
│   │   │   │   └── useForgotPassword.ts
│   │   │   ├── api/                 # API client functions
│   │   │   │   └── authApi.ts
│   │   │   ├── types/               # Feature-specific types
│   │   │   │   └── auth.types.ts
│   │   │   └── __tests__/           # Feature tests
│   │   │       ├── LoginForm.test.tsx
│   │   │       └── useLogin.test.ts
│   │   │
│   │   └── todos/
│   │       ├── components/
│   │       │   ├── TodoList.tsx
│   │       │   ├── TodoItem.tsx
│   │       │   ├── TodoForm.tsx
│   │       │   └── TodoFilters.tsx
│   │       ├── hooks/
│   │       │   ├── useTodos.ts      # Fetch all todos
│   │       │   ├── useCreateTodo.ts
│   │       │   ├── useUpdateTodo.ts
│   │       │   └── useDeleteTodo.ts
│   │       ├── api/
│   │       │   └── todosApi.ts
│   │       ├── types/
│   │       │   └── todo.types.ts
│   │       └── __tests__/
│   │
│   ├── pages/                       # Route pages (thin wrappers)
│   │   ├── LoginPage/
│   │   │   └── LoginPage.tsx        # Renders auth/LoginForm
│   │   ├── RegisterPage/
│   │   │   └── RegisterPage.tsx
│   │   ├── DashboardPage/
│   │   │   └── DashboardPage.tsx    # Renders todos/TodoList
│   │   └── NotFoundPage/
│   │       └── NotFoundPage.tsx
│   │
│   ├── shared/                      # Shared/reusable code
│   │   ├── components/              # Generic UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Layout/
│   │   │   └── ProtectedRoute/
│   │   ├── hooks/                   # Shared hooks
│   │   │   ├── useAuth.ts           # Auth context consumer
│   │   │   └── useToast.ts          # Notifications
│   │   ├── contexts/                # React contexts
│   │   │   └── AuthContext.tsx      # Auth state management
│   │   ├── api/                     # API infrastructure
│   │   │   ├── apiClient.ts         # Axios instance + interceptors
│   │   │   └── queryClient.ts       # React Query configuration
│   │   ├── types/                   # Shared TypeScript types
│   │   │   └── common.types.ts
│   │   └── utils/                   # Helper functions
│   │       ├── validation.ts
│   │       └── storage.ts           # localStorage wrapper
│   │
│   ├── test/                        # Test utilities
│   │   ├── setup.ts                 # Test environment setup
│   │   ├── mocks/                   # Mock data
│   │   └── utils/                   # Test helpers
│   │
│   ├── App.tsx                      # Root component + routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Structure Explanation

**features/** - Feature-based organization
- Each feature is self-contained (components, hooks, API, types)
- Easy to locate related code
- Scalable as features grow

**pages/** - Routing layer
- Thin wrappers that render feature components
- Handle page-level concerns (document title, layout)
- Map routes to features

**shared/** - Reusable code
- Generic components used across features
- Shared hooks and contexts
- API infrastructure
- Common utilities

**Separation of Concerns:**
- **components/** → Presentational (UI only)
- **hooks/** → Business logic + API calls
- **api/** → Pure HTTP functions (no React)
- **types/** → TypeScript definitions

---

## Implementation Progress

### [DONE] Foundation & TDD Setup

**Completed:**
- ✅ Folder structure created (features, pages, shared, test)
- ✅ Vite configured (aliases, proxy, Vitest)
- ✅ TypeScript configured (path aliases, strict mode)
- ✅ Test environment setup (`src/test/setup.ts`)

**Files:**
- `vite.config.ts` - Path aliases, backend proxy, test config
- `tsconfig.app.json` - TypeScript paths, strict checks
- `src/test/setup.ts` - Jest-DOM matchers

---

### [DONE] API Client (TDD Implementation)

**File:** `shared/api/apiClient.ts` + `apiClient.test.ts`

**Features Implemented:**
1. Axios instance with `/api` baseURL
2. Request interceptor - JWT token attachment
3. Response interceptor - 401 error handling (logout + redirect)
4. Domain check - prevent token leakage to external URLs

**Tests:** 5 passing
- Axios instance configuration
- Token attachment when exists
- No token when missing
- External URL protection (security)

**Key Patterns:**
```typescript
// Mock setup BEFORE import
vi.mock('axios', () => ({
  default: { create: vi.fn(() => mockInstance) }
}));
const { apiClient } = await import('./apiClient');

// Extract interceptor for testing
const interceptor = vi.mocked(apiClient.interceptors.request.use)
  .mock.calls[0]?.[0];

// Test behavior
const result = interceptor(mockConfig);
expect(result.headers.Authorization).toBe('Bearer token');
```

**Security:** Domain check prevents token leakage to third-party APIs

**Run tests:** `npm test`

---

### Next Steps

1. **AuthContext** - Global auth state (user, login, logout)
2. **Auth API** - `features/auth/api/authApi.ts` (login, register, reset)
3. **Auth Hooks** - `useLogin`, `useRegister` with React Query
4. **Login Component** - Form with validation (React Hook Form + Zod)
5. **Protected Routes** - Auth guards for dashboard

**TDD Workflow:**
- Write test first (RED)
- Implement minimal code (GREEN)
- Refactor if needed
- Repeat

---

