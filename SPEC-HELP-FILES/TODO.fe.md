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
│   │       │   ├── useTodos.ts         # Fetch all todos
│   │       │   ├── useTodoMutation.ts  # Shared factory (DRY)
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

### **Test Summary: 169 tests passing**

**Infrastructure Layer (19 tests):**
- ✅ API Client: 8 tests (error message transformation)
- ✅ Auth API Layer: 6 tests
- ✅ AuthContext: 5 tests

**Auth Feature (73 tests):**
- ✅ Auth Hooks: 19 tests (useLogin, useRegister, useForgotPassword, useResetPassword)
- ✅ Auth Components: 50 tests (LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm)
- ✅ Route Guards: 4 tests (ProtectedRoute, PublicRoute)

**Todo Feature (77 tests):**
- ✅ Todo API Layer: 10 tests (getTodos, getTodoById, createTodo, updateTodo, deleteTodo)
- ✅ Todo Hooks: 24 tests (useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo)
- ✅ Todo Components: 27 tests (TodoItem, TodoList, TodoForm)
- ✅ TodosPage: 16 tests (integration, layout, logout)

---

### [DONE] 1. API Client
**File:** `shared/api/apiClient.ts` + test
**Tests:** 8 passing
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

// Response interceptor - 401 handling + error transformation
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Transform backend errors to clean messages
    let errorMessage = 'Something went wrong. Please try again.';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
```

**Key lesson:** Error transformation in interceptor prevents "Request failed with status code 400" messages. Extract meaningful backend errors.

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

### [DONE] 5. Auth Hooks (React Query)
**Files:** `features/auth/hooks/` - 4 hooks implemented
**Tests:** 19 passing (4 + 4 + 5 + 6)

**Hooks implemented:**
1. **useLogin** (4 tests) - Authenticate existing user
2. **useRegister** (4 tests) - Create new user + auto-login
3. **useForgotPassword** (5 tests) - Send password reset email
4. **useResetPassword** (6 tests) - Reset password with token

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
const { mutate: login, isPending, error } = useLogin();
login({ email, password });
```

**Key decisions:**
- **Auto-login:** `useLogin` and `useRegister` update AuthContext on success
- **No auto-login:** `useForgotPassword` and `useResetPassword` don't update AuthContext (security best practice)
- **Consistent pattern:** All hooks use `useMutation` from React Query
- **Loading/error states:** Free from React Query (no manual state management)

**What we learned:**
- `useMutation` provides automatic loading/error/success states
- When to update AuthContext (login/register yes, reset password no)
- TDD workflow reinforcement (RED → GREEN → REFACTOR)
- Testing React Query hooks with `renderHook` and `waitFor`
- Creating test wrappers with QueryClientProvider

---

### [DONE] 6. Auth UI Components
**Files:** `features/auth/components/` - 4 forms implemented
**Tests:** 50 passing (13 + 13 + 10 + 14)
**Tech Stack:** React Hook Form + Zod validation + MUI

**Components:**
1. **LoginForm** (13 tests) - Email + password with visibility toggle
2. **RegisterForm** (13 tests) - Name + email + password with visibility toggle
3. **ForgotPasswordForm** (10 tests) - Email only, success message
4. **ResetPasswordForm** (14 tests) - New password + confirm password, both with toggles

**Pattern:**
```typescript
// Form setup
const { mutate: login, isPending, error } = useLogin();
const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
  resolver: zodResolver(loginSchema),
});

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Password visibility toggle
const [showPassword, setShowPassword] = useState(false);
<IconButton onClick={() => setShowPassword(!showPassword)} disableRipple disableFocusRipple>
  {showPassword ? <VisibilityOff /> : <Visibility />}
</IconButton>
```

**Centering forms:**
```typescript
<Box sx={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  overflow: 'auto',  // Responsive scrolling
}}>
```

**Key lessons:**
- Password visibility toggle: `disableRipple` + `disableFocusRipple` + transparent backgrounds removes ugly circle
- Form centering: `position: fixed` with viewport coverage prevents CSS conflicts
- Exact label matching in tests: `screen.getByLabelText('Password')` not regex (avoids multiple matches with toggle button)
- Chained Zod validation: `.min(1, 'Required').min(6, 'Too short')` for different error messages

---

### [DONE] 7. Protected Routes
**Files:** `shared/components/ProtectedRoute.tsx`, `PublicRoute.tsx`
**Tests:** 4 passing (2 + 2)

**ProtectedRoute** - Guards authenticated pages:
```typescript
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Usage in App.tsx
<Route path="/todos" element={
  <ProtectedRoute><TodosPage /></ProtectedRoute>
} />
```

**PublicRoute** - Redirects authenticated users from auth pages:
```typescript
export const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/todos" replace />;
  return <>{children}</>;
};

// Usage in App.tsx
<Route path="/login" element={
  <PublicRoute><LoginPage /></PublicRoute>
} />
```

**Routing setup:**
- `/login`, `/register`, `/forgot-password` → PublicRoute (redirect to `/todos` if logged in)
- `/reset-password` → No guard (public link from email)
- `/todos` → ProtectedRoute (redirect to `/login` if not authenticated)
- `/` → Redirect to `/login`

---

### [DONE] 8. CI/CD Pipeline
**File:** `.github/workflows/test.yml`
**Jobs:** `backend-tests` + `frontend-tests` (parallel execution)

**Frontend job:**
```yaml
frontend-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    - run: npm ci
      working-directory: ./frontend
    - run: npm test -- --run
      working-directory: ./frontend
    - run: npm run build
      working-directory: ./frontend
```

**Key benefit:** Both BE and FE tests run in parallel. PRs can't merge if tests fail.

---

### [DONE] 9. Todo CRUD Features
**Files:** `features/todos/` - Complete CRUD implementation
**Tests:** 77 passing (10 API + 24 hooks + 27 components + 16 page)
**Pattern:** Followed exact same sequence as auth - proved architecture is reusable

---

## HOW We Built Todo CRUD (The Process)

**This section documents the SEQUENCE OF ACTIONS - the "how", not the "what"**

### Step 1: Analyze Backend Contract First
**Before writing any code**, understand what the backend provides:

```bash
# Read backend files to understand API contract
- backend/src/routers/todos.ts → See available endpoints
- backend/src/controllers/todos.controller.ts → See request/response formats
```

**Key findings:**
- 5 endpoints: GET all, GET by id, POST, PUT, DELETE
- All require authentication (token in header)
- Backend filters todos by userId automatically
- Response format: `{ message, todos }` or `{ message, todo }`

**Why this matters:** Types must match backend exactly, API functions know the contract.

---

### Step 2: Create Types (Data Structure)
**File:** `features/todos/types/todo.types.ts`
**Action:** Define TypeScript interfaces matching backend Prisma model

```typescript
// Core entity (matches backend)
interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs for mutations
interface CreateTodoData { title: string; description?: string; }
interface UpdateTodoData { title?: string; description?: string; completed?: boolean; }

// API response types (matches backend controllers)
interface TodosResponse { message: string; todos: Todo[]; }
interface TodoResponse { message: string; todo: Todo; }
interface DeleteTodoResponse { message: string; }
```

**Why first:** Types inform everything else. If you know the shape, you can build with confidence.

---

### Step 3: Build API Layer (TDD)
**Files:** `features/todos/api/todosApi.test.ts` → `todosApi.ts`
**Tests:** 10 passing (2 per function)
**Pattern:** Test first, implement second

**Sequence:**
1. Write test for `getTodos()` - verify it calls `apiClient.get('/todos')` and returns array
2. Implement `getTodos()` - simple wrapper around apiClient
3. Repeat for `getTodoById()`, `createTodo()`, `updateTodo()`, `deleteTodo()`
4. Run all tests - verify API layer works

**Key pattern:**
```typescript
export const getTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get<TodosResponse>('/todos');
  return response.data.todos; // Unwrap backend response
};
```

**Common mistake caught by tests:**
- ❌ Default import: `import apiClient from '@/shared/api/apiClient'`
- ✅ Named import: `import { apiClient } from '@/shared/api/apiClient'`

---

### Step 4: Build React Query Hooks (TDD)
**Files:** 5 hooks total (1 query hook + 1 shared factory + 3 mutation hooks)
**Tests:** 24 passing (5-7 tests per hook)
**Pattern:** Test → Implement → Verify → Next hook

**Sequence for each hook:**

#### A. useTodos (Query Hook)
1. Write test file: `useTodos.test.tsx`
   - Test: Fetch todos successfully
   - Test: Return empty array when no todos
   - Test: Show loading state
   - Test: Handle errors
   - Test: Use correct query key
2. Implement: `useTodos.ts`
   ```typescript
   export const useTodos = () => {
     return useQuery({
       queryKey: ['todos'],
       queryFn: getTodos,
     });
   };
   ```
3. Run tests - all 5 passing
4. Move to next hook

#### B. useTodoMutation (Shared Hook Factory)
**File:** `hooks/useTodoMutation.ts`
**Purpose:** Eliminates code duplication across create/update/delete hooks

This factory centralizes the cache invalidation logic that all three mutation hooks need:

```typescript
export const useTodoMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```

**Benefits:**
- DRY principle - cache invalidation logic in one place
- Easy to extend - add optimistic updates or error handling for all mutations at once
- Maintainable - changes to cache strategy only need one file update
- Type-safe - Generic types preserve type safety for each mutation

#### C. useCreateTodo (Mutation Hook)
1. Write test file: `useCreateTodo.test.tsx`
   - Test: Call API on mutation
   - Test: Return created todo
   - Test: Invalidate cache on success (important!)
   - Test: Handle loading state
   - Test: Handle errors
   - Test: Work without description
2. Implement: `useCreateTodo.ts` (using the factory)
   ```typescript
   export const useCreateTodo = () => {
     return useTodoMutation(createTodo);
   };
   ```
3. Run tests - all 6 passing

#### D. useUpdateTodo (Mutation Hook)
- Same TDD pattern as create
- Tests include toggling completion status
- Tests multiple field updates
- Uses factory with wrapper for API signature mismatch:
  ```typescript
  export const useUpdateTodo = () => {
    return useTodoMutation(
      ({ id, data }) => updateTodo(id, data)
    );
  };
  ```
- 7 tests passing

#### E. useDeleteTodo (Mutation Hook)
- Same TDD pattern
- Tests sequential deletions
- Uses factory: `return useTodoMutation(deleteTodo);`
- 6 tests passing

**Why this order:** Query hook first (read), then shared factory (DRY), then mutations (write). Each hook builds confidence.

**Refactoring note:** The factory pattern was added after initial implementation when duplication was identified across all three mutation hooks. Tests passed without modification, proving the refactoring was safe.

---

### Step 5: Build UI Components (TDD)
**Files:** 3 components, each with test file first
**Tests:** 27 passing (10 + 7 + 10)
**Pattern:** Test → Implement → Verify → Next component

**Sequence:**

#### A. TodoItem (Smallest Component First)
1. Write test file: `TodoItem.test.tsx`
   - Test: Render title and description
   - Test: Render without description
   - Test: Checkbox state (checked/unchecked)
   - Test: Call onToggle when checkbox clicked
   - Test: Call onDelete when delete button clicked
   - Test: Strikethrough style for completed todos
   - Test: Delete button renders
2. Implement: `TodoItem.tsx`
   ```typescript
   <ListItem secondaryAction={<IconButton onClick={() => onDelete(todo.id)}><DeleteIcon /></IconButton>}>
     <Checkbox checked={todo.completed} onChange={(e) => onToggle(todo.id, e.target.checked)} />
     <ListItemText
       primary={<Typography sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</Typography>}
       secondary={todo.description}
     />
   </ListItem>
   ```
3. Run tests - all 10 passing

#### B. TodoList (Container Component)
1. Write test file: `TodoList.test.tsx`
   - Mock TodoItem component (simplify testing)
   - Test: Render list of todos
   - Test: Empty state message
   - Test: Pass handlers to children
   - Test: Correct number of items
2. Implement: `TodoList.tsx`
   ```typescript
   if (todos.length === 0) return <EmptyState />;
   return <List>{todos.map(todo => <TodoItem key={todo.id} ... />)}</List>;
   ```
3. Run tests - all 7 passing

#### C. TodoForm (Form Component)
1. Write test file: `TodoForm.test.tsx`
   - Test: Render fields
   - Test: Submit with data
   - Test: Submit with only title
   - Test: Validation errors (empty title, too short)
   - Test: Clear form after success
   - Test: Disable during submission
   - Test: Typing in fields works
2. Implement: `TodoForm.tsx`
   ```typescript
   const todoSchema = z.object({
     title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
     description: z.string().optional(),
   });

   // React Hook Form + Zod
   const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTodoData>({
     resolver: zodResolver(todoSchema),
   });
   ```
3. Run tests - all 10 passing

**Common issue caught:** Zod chaining - `.min(1).min(3)` shows the second error when length is 0

---

### Step 6: Build Page Integration
**File:** `pages/TodosPage/TodosPage.tsx` + test
**Tests:** 16 passing
**Action:** Wire all pieces together

**Implementation sequence:**
1. Import all hooks and components
2. Call hooks at component top level
3. Create handler functions that call mutations
4. Handle loading state (show spinner)
5. Handle error state (show error message)
6. Render main content with handlers passed down
7. Show mutation errors at bottom

**Critical fix applied - CENTERING ISSUE:**
Same problem as LoginPage - content not centered. Applied same fix:
```typescript
<Box
  data-testid="todos-page-container"
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    bgcolor: 'background.default',
    overflow: 'auto',
  }}
>
  <Container maxWidth="md">{/* content */}</Container>
</Box>
```

**Added logout button:**
```typescript
<Box sx={{ position: 'absolute', top: 16, right: 16 }}>
  <Button variant="contained" onClick={handleLogout}>Logout</Button>
</Box>
```

**Tests cover:**
- Layout centering (3 tests)
- Logout button (2 tests)
- Content rendering (3 tests)
- Loading state (2 tests)
- Error state (2 tests)
- Todo operations (4 tests)

---

### Step 7: Run Full Test Suite
```bash
npm test
```

**Result:** 169 tests passing
- Auth: 92 tests (from previous phase)
- Todos: 77 tests (new)
  - API layer: 10 tests
  - Hooks layer: 24 tests
  - Components: 27 tests
  - Page: 16 tests

**What success means:** Every layer tested independently and integration tested.

---

## The Proven Process (Reusable Steps for Any Feature)

### Phase 1: Foundation
1. ✅ **Analyze backend contract** - Read routes + controllers
2. ✅ **Create types** - Match backend exactly
3. ✅ **Build API layer with tests** - Pure HTTP functions
4. ✅ **Verify API tests pass** - Ensure contract is correct

### Phase 2: Business Logic
5. ✅ **Build query hooks with tests** - Read operations (useQuery)
6. ✅ **Build mutation hooks with tests** - Write operations (useMutation)
7. ✅ **Verify all hooks pass** - Ensure React Query integration works

### Phase 3: UI
8. ✅ **Build small components with tests** - Start with leaves (TodoItem)
9. ✅ **Build container components with tests** - Move up tree (TodoList)
10. ✅ **Build form components with tests** - Handle user input (TodoForm)
11. ✅ **Verify all component tests pass** - Ensure UI works in isolation

### Phase 4: Integration
12. ✅ **Build page component** - Wire hooks + components together
13. ✅ **Add page tests** - Test integration and layout
14. ✅ **Apply common patterns** - Centering, logout, error handling
15. ✅ **Run full test suite** - Verify nothing broke

### Phase 5: Verification
16. ✅ **Manual testing** - Actually use the feature
17. ✅ **Check CI/CD** - Ensure tests run in pipeline
18. ✅ **Update documentation** - Record what you learned

---

## Critical Lessons from Todo Implementation

### What Worked (Do This)
1. **Exact same pattern as auth** - Proved architecture is reusable
2. **TDD throughout** - Caught import errors, validation bugs, integration issues
3. **Incremental layers** - Each layer validates before moving up
4. **Test counts as progress metric** - 153 → 169 tests = visible progress
5. **Colocated tests** - Easy to find and maintain

### What Needed Fixing (Watch For)
6. **Centering consistency** - Use EXACT same Box pattern as LoginPage for all full-page layouts
7. **Named exports** - `import { apiClient }` not `import apiClient` (caught by tests)
8. **Zod validation order** - `.min(1).min(3)` shows second message only when > 0 length
9. **Cache invalidation** - MUST invalidate queries after mutations (or UI doesn't update)
10. **Button styling consistency** - Use same variant for similar actions (logout = contained, like submit buttons)

### Process Improvements Discovered
11. **Backend first** - Always analyze API contract before writing types
12. **Types inform API** - Types make API layer obvious to implement
13. **API informs hooks** - API layer makes hooks straightforward
14. **Hooks inform components** - Components just consume what hooks provide
15. **Components inform page** - Page just wires components together

### Code Quality & Refactoring
16. **DRY for shared patterns** - Extract hook factories when multiple hooks share identical logic
   - Example: `useTodoMutation` factory eliminated duplicate cache invalidation across 3 hooks
   - Reduced each mutation hook from 18 lines to 1-3 lines
   - Centralized cache strategy - future changes (optimistic updates, error handling) only need one file
   - Tests passed without modification after refactoring (proof of safety)
17. **Refactor when duplication is clear** - Don't over-engineer upfront, but refactor when patterns emerge
   - Initial implementation: Write code that works (3 similar hooks)
   - Identify duplication: All 3 hooks have identical `onSuccess` logic
   - Extract abstraction: Create factory to eliminate duplication
   - Verify: Run tests to ensure behavior unchanged

### Time Savers
18. **Mock components in integration tests** - TodoList test mocked TodoItem (faster, simpler)
19. **Wrapper pattern** - Reuse QueryClientProvider wrapper across all hook tests
20. **Common test data** - Define mock todos once, reuse everywhere
21. **AAA pattern** - Makes tests instantly readable
22. **Run tests frequently** - Catch issues immediately, not after writing 100 lines

---

## Testing Patterns (Reusable Reference)

### 1. Mock apiClient (Infrastructure Layer)
```typescript
// Mock axios-based apiClient
vi.mock('@shared/api/apiClient', () => ({
  apiClient: { post: vi.fn() }
}));

// Mock API responses
vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });
```

### 2. Test Context Hooks (State Management)
```typescript
// Testing AuthContext in isolation
const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
act(() => result.current.login(token, user));
expect(result.current.isAuthenticated).toBe(true);
```

### 3. Test React Query Hooks (Business Logic)
**Setup (before each test):**
```typescript
let queryClient: QueryClient;

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
});
```

**Wrapper pattern:**
```typescript
const createWrapper = () => {
  const mockLogin = vi.fn();

  // Mock AuthContext if needed
  vi.mocked(useAuth).mockReturnValue({
    login: mockLogin,
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
  });

  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    mockLogin, // Return mocks for assertions
  };
};
```

**Test mutation calls:**
```typescript
it('should call API on mutation', async () => {
  // ARRANGE
  const { wrapper } = createWrapper();
  vi.mocked(loginUser).mockResolvedValue(mockResponse);

  // ACT
  const { result } = renderHook(() => useLogin(), { wrapper });
  result.current.mutate({ email, password });

  // ASSERT
  await waitFor(() => {
    expect(loginUser).toHaveBeenCalledWith({ email, password });
  });
});
```

**Test loading states:**
```typescript
it('should return loading state during mutation', async () => {
  const { wrapper } = createWrapper();
  vi.mocked(loginUser).mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 100))
  );

  const { result } = renderHook(() => useLogin(), { wrapper });

  expect(result.current.isPending).toBe(false); // Initial
  result.current.mutate({ email, password });

  await waitFor(() => {
    expect(result.current.isPending).toBe(true); // During mutation
  });
});
```

**Test success callbacks:**
```typescript
it('should call AuthContext.login on success', async () => {
  const { wrapper, mockLogin } = createWrapper();
  vi.mocked(loginUser).mockResolvedValue(mockResponse);

  const { result } = renderHook(() => useLogin(), { wrapper });
  result.current.mutate({ email, password });

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith(token, user);
  });
});
```

**Test error handling:**
```typescript
it('should handle API errors', async () => {
  const { wrapper } = createWrapper();
  const mockError = new Error('Invalid credentials');
  vi.mocked(loginUser).mockRejectedValue(mockError);

  const { result } = renderHook(() => useLogin(), { wrapper });
  result.current.mutate({ email, password });

  await waitFor(() => {
    expect(result.current.error).toEqual(mockError);
  });
});
```

### 4. Important Notes

**File extensions for JSX:**
- Use `.tsx` for test files that render JSX (wrapper components)
- Use `.ts` for test files without JSX

**React import in tests:**
- **Modern React (17+):** No need to import React for JSX
- Just import types: `import { type ReactNode } from 'react';`

**AAA Pattern (Arrange-Act-Assert):**
- Always structure tests with clear sections
- Makes tests readable and maintainable

**waitFor vs act:**
- `waitFor`: Use for async operations (API calls, state updates)
- `act`: Use for synchronous state updates (deprecated for most cases with React Testing Library)

---

## Key Lessons Learned

### Architecture & Design
1. **Separation of layers** - API (HTTP) → Hooks (React Query) → Components (UI)
   - API layer: Pure functions, no React dependencies
   - Hooks layer: Business logic + React Query integration
   - Components: UI only, consume hooks

2. **Simple > Complex** - Avoid over-engineering
   - Keep implementations minimal
   - Don't add abstractions until needed

3. **No mixing concerns** - Components don't call APIs directly
   - Always use hooks as intermediary
   - Keeps components testable and maintainable

### React Query (useMutation)
4. **useMutation benefits:**
   - Automatic loading/error/success states
   - No manual try-catch needed
   - Built-in retry logic available
   - Consistent pattern across all mutations

5. **When to update AuthContext:**
   - ✅ Login/Register → Auto-login after success
   - ❌ ForgotPassword/ResetPassword → Security best practice (manual login)

### Testing & TDD
6. **TDD workflow value:**
   - RED: Write failing test (think through requirements)
   - GREEN: Implement minimal code
   - REFACTOR: Improve (often not needed initially)
   - Forces you to think about API design before implementation

7. **Testing patterns:**
   - Mock external dependencies (API, context)
   - Test behavior, not implementation
   - Use AAA pattern (Arrange-Act-Assert)
   - Test loading states, success, and errors

8. **When TDD is valuable:**
   - Complex business logic (auth flows, validation)
   - Learning new patterns (React Query, hooks)
   - Team environments (ensures tests exist)
   - Refactoring (tests prevent regressions)

9. **Test setup issues ≠ failed tests:**
   - JSX syntax errors (file extension, imports)
   - Timing issues (waitFor for async)
   - These are setup problems, not real RED phase

### React Patterns
10. **Modern React (17+):**
    - No React import needed for JSX
    - New JSX transform doesn't use `React.createElement()`

11. **Hook testing:**
    - Use `renderHook` from React Testing Library
    - Create fresh QueryClient per test (isolation)
    - Return mocks from wrapper for assertions

### UI & UX Patterns
12. **Password visibility toggles:**
    - Use MUI IconButton with Visibility/VisibilityOff icons
    - `disableRipple` + `disableFocusRipple` + transparent sx removes ugly focus circle
    - Separate state for each password field (don't share toggles)

13. **Form centering:**
    - `position: fixed` with full viewport (`top: 0, left: 0, right: 0, bottom: 0`)
    - Prevents CSS conflicts from global styles
    - Add `overflow: 'auto'` for responsive scrolling

14. **Test selector specificity:**
    - Use exact strings for labels: `getByLabelText('Password')` not `/password/i`
    - Regex matching breaks when multiple elements match (button + input)

15. **Error message UX:**
    - Transform backend errors in apiClient interceptor
    - Show meaningful messages ("User already exists") not HTTP codes ("Request failed with status 400")
    - Fallback to generic message for network errors

### CI/CD Best Practices
16. **Add tests to CI early:**
    - Don't wait until "code is stable"
    - 92 tests is substantial - protect with CI now
    - Parallel jobs (backend-tests + frontend-tests) for speed
    - Include build step to catch TypeScript errors

---

## 🎉 Phase 2 Complete: Authentication System

### What We Built:
✅ **92 tests passing** across 13 test files
✅ **Infrastructure:** apiClient (with error handling), authApi, AuthContext
✅ **Business Logic:** 4 auth hooks (login, register, forgot/reset password)
✅ **UI Components:** 4 forms with validation, error display, password toggles
✅ **Route Guards:** ProtectedRoute, PublicRoute
✅ **CI/CD:** GitHub Actions running both BE + FE tests in parallel

---

## 🎉 Phase 3 Complete: Todo CRUD Features

### What We Built:
✅ **169 tests passing** total (92 auth + 77 todos)
✅ **Todo API Layer:** 5 functions (getTodos, getTodoById, createTodo, updateTodo, deleteTodo) - 10 tests
✅ **Todo Hooks:** 4 hooks (useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo) - 24 tests
✅ **Todo Components:** 3 components (TodoItem, TodoList, TodoForm) - 27 tests
✅ **TodosPage:** Full integration with centering, logout button - 16 tests
✅ **Proven Architecture:** Same pattern as auth worked perfectly

### Final Architecture:
```
[Backend API] ← Express + Prisma
    ↓
[apiClient] ← axios + interceptors + error transformation
    ↓
[Feature APIs] ← authApi, todosApi (pure HTTP functions)
    ↓
[Feature Hooks] ← React Query (useQuery + useMutation)
    ↓
[Feature Components] ← React Hook Form + Zod + MUI
    ↓
[Pages] ← Integration layer (wires hooks + components)
    ↓
[Route Guards] ← ProtectedRoute/PublicRoute
    ↓
[App.tsx] ← Routing + AuthProvider + QueryClientProvider
```

### What We Proved:
1. **Architecture is reusable** - Same pattern worked for both auth and todos
2. **TDD is valuable** - Caught bugs early, gave confidence to refactor
3. **Layered approach scales** - Types → API → Hooks → Components → Page
4. **Tests as documentation** - 169 tests show exactly what the app does
5. **Process is teachable** - Follow the steps, get predictable results

### What's Next: Phase 4 - Deployment
1. Containerize frontend (Docker)
2. Configure production build
3. Deploy to cloud (optional)
4. Monitor in production

---

## Next Session Plan

### Goals for Follow-up Session:
1. **Learn from this documentation** - Review the "HOW We Built Todo CRUD" section to understand:
   - The sequence of actions (backend analysis → types → API → hooks → components → page)
   - Why we do things in this order
   - What patterns are reusable for any feature
   - What mistakes to avoid

2. **Containerize Frontend** - Wrap FE into Docker container:
   - Create Dockerfile for production build
   - Configure nginx to serve static files
   - Set up multi-stage build for optimization
   - Test container locally
   - Update docker-compose to include frontend service

### Key Takeaways to Remember:
- **Process > Code** - The HOW matters more than the WHAT
- **Layers from bottom up** - Types → API → Hooks → Components → Page
- **TDD throughout** - Tests first, implementation second
- **Incremental validation** - Run tests after each layer
- **Patterns proven** - Same approach worked for auth and todos, will work for future features

### Success Metrics:
- ✅ 169 tests passing (100% of features tested)
- ✅ Clean separation of concerns (types, API, hooks, components, pages)
- ✅ Reusable architecture (proven with 2 features)
- ✅ Documented process (this file serves as guide)
- ⏳ Containerized deployment (next step)

---

