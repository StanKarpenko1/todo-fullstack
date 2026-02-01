import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteTodo } from '../hooks/useDeleteTodo';
import { deleteTodo } from '../api/todosApi';
import { type ReactNode } from 'react';
import type { Todo } from '../types/todo.types';

// Mock todosApi
vi.mock('../api/todosApi');

describe('useDeleteTodo', () => {
  let queryClient: QueryClient;

  const mockTodo: Todo = {
    id: '1',
    title: 'Todo to Delete',
    description: 'This will be deleted',
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

  it('should call deleteTodo API on mutation', async () => {
    // ARRANGE
    vi.mocked(deleteTodo).mockResolvedValue(undefined);

    // ACT
    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate('1');

    // ASSERT
    await waitFor(() => {
      expect(deleteTodo).toHaveBeenCalledWith('1');
    });
  });

  it('should successfully complete deletion', async () => {
    // ARRANGE
    vi.mocked(deleteTodo).mockResolvedValue(undefined);

    // ACT
    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate('1');

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should invalidate todos query on success', async () => {
    // ARRANGE
    vi.mocked(deleteTodo).mockResolvedValue(undefined);

    // Set up query cache with initial data
    queryClient.setQueryData(['todos'], [mockTodo]);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // ACT
    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate('1');

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('should handle loading state during mutation', async () => {
    // ARRANGE
    vi.mocked(deleteTodo).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
    );

    // ACT
    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate('1');

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const mockError = new Error('Failed to delete todo');
    vi.mocked(deleteTodo).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate('1');

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should handle deletion of multiple todos sequentially', async () => {
    // ARRANGE
    vi.mocked(deleteTodo).mockResolvedValue(undefined);

    // ACT
    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: createWrapper(),
    });

    // Delete first todo
    result.current.mutate('1');
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Delete second todo
    result.current.mutate('2');
    await waitFor(() => {
      expect(deleteTodo).toHaveBeenCalledWith('2');
    });

    // ASSERT
    expect(deleteTodo).toHaveBeenCalledTimes(2);
    expect(deleteTodo).toHaveBeenNthCalledWith(1, '1');
    expect(deleteTodo).toHaveBeenNthCalledWith(2, '2');
  });
});
