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

### [DONE] 1. API Client
**File:** `shared/api/apiClient.ts` + test
**Tests:** 4 passing
**Implementation:**
```typescript
// Axios instance with baseURL
export const apiClient = axios.create({ baseURL: '/api' });

// Request interceptor - attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Key lesson:** Keep it simple. No over-engineering. Token attached to all requests, 401 auto-logout.

---

### [DONE] 2. Auth Types
**File:** `features/auth/types/auth.types.ts`
```typescript
interface User { id: string; email: string; name: string; }
interface LoginCredentials { email: string; password: string; }
interface RegisterData { name: string; email: string; password: string; }
interface AuthResponse { token: string; user: User; }
```

---

### [DONE] 3. AuthContext
**File:** `shared/contexts/AuthContext.tsx` + test
**Tests:** 5 passing
**Provides:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

**Key features:**
- State persistence (localStorage restore on mount)
- `login(token, user)` - stores token + user
- `logout()` - clears everything
- Error if used outside provider

**Implementation:**
```typescript
const [user, setUser] = useState<User | null>(null);

// Restore on mount
useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (token && storedUser) setUser(JSON.parse(storedUser));
}, []);

const login = (token, userData) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
};
```

**Wired in:** `App.tsx` wrapped with `<AuthProvider>`

---

### [DONE] 4. Auth API Layer
**File:** `features/auth/api/authApi.ts` + test
**Tests:** 6 passing
**Functions:**
```typescript
loginUser(credentials) → POST /auth/login → AuthResponse
registerUser(userData) → POST /auth/register → AuthResponse
forgotPassword(email) → POST /auth/forgot-password → { message }
resetPassword(token, password) → POST /auth/reset-password → { message }
```

**Pattern:** Pure HTTP functions, no React dependencies
```typescript
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data;
};
```

---

### [NEXT] 5. Auth Hooks (React Query)
**Files:** `features/auth/hooks/useLogin.ts`, `useRegister.ts`
**Purpose:** Connect API + AuthContext with React Query mutations

**Pattern:**
```typescript
export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.token, data.user);
    },
  });
};

// Usage in component:
const { mutate: login, isPending } = useLogin();
login({ email, password });
```

**Provides:** Loading states, error handling, automatic AuthContext updates

---

### [TODO] 6. Login Form Component
**File:** `features/auth/components/LoginForm.tsx`
**Tech:** React Hook Form + Zod validation + MUI
**First visible UI**

**Pattern:**
```typescript
const { mutate: login, isPending } = useLogin();
const { register, handleSubmit } = useForm<LoginCredentials>();

const onSubmit = (data) => login(data);
```

---

### [TODO] 7. Routing + Protected Routes
**Files:** `App.tsx` (React Router), `shared/components/ProtectedRoute.tsx`
**Routes:**
- `/login` - LoginPage
- `/register` - RegisterPage
- `/dashboard` - DashboardPage (protected)

**Protected route pattern:**
```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

---

## Testing Patterns (Reusable)

### Mock apiClient
```typescript
vi.mock('@shared/api/apiClient', () => ({
  apiClient: { post: vi.fn() }
}));
vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });
```

### Test Context Hooks
```typescript
const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
act(() => result.current.login(token, user));
expect(result.current.isAuthenticated).toBe(true);
```

### Test React Query Hooks
```typescript
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
);
const { result } = renderHook(() => useLogin(), { wrapper });
```

---

## Key Lessons

1. **Simple > Complex** - Removed URL security checks (over-engineering)
2. **Separation of layers** - API (HTTP) → Hooks (React Query) → Components (UI)
3. **TDD workflow** - Write test → implement → refactor
4. **No mixing concerns** - Components don't call APIs directly
5. **Pure functions** - API layer has no React dependencies

---

