import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateTodo } from '../hooks/useCreateTodo';
import { createTodo } from '../api/todosApi';
import { type ReactNode } from 'react';
import type { Todo, CreateTodoData } from '../types/todo.types';

// Mock todosApi
vi.mock('../api/todosApi');

describe('useCreateTodo', () => {
  let queryClient: QueryClient;

  const mockTodo: Todo = {
    id: '1',
    title: 'New Todo',
    description: 'New Description',
    completed: false,
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Create fresh QueryClient for each test (isolation)
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  // Helper: Wrapper with React Query
  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('should call createTodo API on mutation', async () => {
    // ARRANGE
    const newTodoData: CreateTodoData = {
      title: 'New Todo',
      description: 'New Description',
    };
    vi.mocked(createTodo).mockResolvedValue(mockTodo);

    // ACT
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(newTodoData);

    // ASSERT
    await waitFor(() => {
      expect(createTodo).toHaveBeenCalledWith(newTodoData);
    });
  });

  it('should return created todo on success', async () => {
    // ARRANGE
    const newTodoData: CreateTodoData = {
      title: 'New Todo',
      description: 'New Description',
    };
    vi.mocked(createTodo).mockResolvedValue(mockTodo);

    // ACT
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(newTodoData);

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTodo);
  });

  it('should invalidate todos query on success', async () => {
    // ARRANGE
    const newTodoData: CreateTodoData = {
      title: 'New Todo',
    };
    vi.mocked(createTodo).mockResolvedValue(mockTodo);

    // Set up query cache with initial data
    queryClient.setQueryData(['todos'], []);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // ACT
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(newTodoData);

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('should handle loading state during mutation', async () => {
    // ARRANGE
    vi.mocked(createTodo).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTodo), 100))
    );

    // ACT
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({ title: 'New Todo' });

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const mockError = new Error('Failed to create todo');
    vi.mocked(createTodo).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ title: 'New Todo' });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should create todo without description', async () => {
    // ARRANGE
    const newTodoData: CreateTodoData = {
      title: 'Todo without description',
    };
    const todoWithoutDescription = { ...mockTodo, description: null };
    vi.mocked(createTodo).mockResolvedValue(todoWithoutDescription);

    // ACT
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(newTodoData);

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createTodo).toHaveBeenCalledWith(newTodoData);
    expect(result.current.data?.description).toBeNull();
  });
});
