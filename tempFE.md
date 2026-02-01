# 1. Analyze Backend First

  Read backend routes/controllers to understand:
  - Available endpoints
  - Request/response formats
  - Authentication requirements

  For todos: Found 5 endpoints (GET all, GET by id, POST, PUT, DELETE)

  ---
  # 2. Create Types

  Define TypeScript interfaces matching backend schema.

  File: features/todos/types/todo.types.ts
  interface Todo { id, title, description, completed, userId, createdAt, updatedAt }
  interface CreateTodoData { title, description? }
  interface UpdateTodoData { title?, description?, completed? }

  ---
  # 3. Build API Layer (Pure HTTP Functions)

  No React here - just axios wrappers.

  File: features/todos/api/todosApi.ts
  export const getTodos = async (): Promise<Todo[]> => {
    const response = await apiClient.get<TodosResponse>('/todos');
    return response.data.todos;
  };

  Tests: 10 tests (2 per function)

  ---
  # 4. Build React Query Hooks

  Business logic + API integration.

  Files: features/todos/hooks/
  - useTodos.ts - useQuery for fetching
  - useCreateTodo.ts - useMutation with cache invalidation
  - useUpdateTodo.ts - useMutation
  - useDeleteTodo.ts - useMutation

  Tests: 24 tests

  ---
  # 5. Build UI Components (Bottom-Up)

  Start with smallest pieces first.

  Order:
  1. TodoItem.tsx - Single todo display (10 tests)
  2. TodoList.tsx - Container for items (7 tests)
  3. TodoForm.tsx - Create new todo (10 tests)

  Tests: 27 tests total

  ---
  # 6. Build Page (Integration Layer)

  Wire hooks + components together.

  File: pages/TodosPage/TodosPage.tsx
  - Calls all hooks at top
  - Creates handler functions
  - Passes handlers to components
  - Handles loading/error states

  Tests: 16 tests

  ---
  # 7. Run Full Test Suite

  Verify all 77 tests pass (10 API + 24 hooks + 27 components + 16 page)

  ---
  Key Pattern

  Each layer depends on the previous:
  - Types inform API layer (know the shapes)
  - API informs hooks (know what to call)
  - Hooks inform components (know what data/actions available)
  - Components inform page (know what to wire together)

  TDD throughout: Write test → Implement → Verify → Next