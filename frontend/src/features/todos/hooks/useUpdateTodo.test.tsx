import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateTodo } from './useUpdateTodo';
import { updateTodo } from '../api/todosApi';
import { type ReactNode } from 'react';
import type { Todo, UpdateTodoData } from '../types/todo.types';

// Mock todosApi
vi.mock('../api/todosApi');

describe('useUpdateTodo', () => {
  let queryClient: QueryClient;

  const mockTodo: Todo = {
    id: '1',
    title: 'Original Todo',
    description: 'Original Description',
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

  it('should call updateTodo API on mutation', async () => {
    // ARRANGE
    const updateData: UpdateTodoData = {
      title: 'Updated Title',
    };
    const updatedTodo = { ...mockTodo, title: 'Updated Title' };
    vi.mocked(updateTodo).mockResolvedValue(updatedTodo);

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: '1', data: updateData });

    // ASSERT
    await waitFor(() => {
      expect(updateTodo).toHaveBeenCalledWith('1', updateData);
    });
  });

  it('should return updated todo on success', async () => {
    // ARRANGE
    const updateData: UpdateTodoData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };
    const updatedTodo = { ...mockTodo, ...updateData };
    vi.mocked(updateTodo).mockResolvedValue(updatedTodo);

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: '1', data: updateData });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedTodo);
  });

  it('should toggle completed status', async () => {
    // ARRANGE
    const updateData: UpdateTodoData = {
      completed: true,
    };
    const updatedTodo = { ...mockTodo, completed: true };
    vi.mocked(updateTodo).mockResolvedValue(updatedTodo);

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: '1', data: updateData });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(updateTodo).toHaveBeenCalledWith('1', updateData);
    expect(result.current.data?.completed).toBe(true);
  });

  it('should invalidate todos query on success', async () => {
    // ARRANGE
    const updateData: UpdateTodoData = {
      title: 'Updated Title',
    };
    const updatedTodo = { ...mockTodo, title: 'Updated Title' };
    vi.mocked(updateTodo).mockResolvedValue(updatedTodo);

    // Set up query cache with initial data
    queryClient.setQueryData(['todos'], [mockTodo]);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: '1', data: updateData });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });

  it('should handle loading state during mutation', async () => {
    // ARRANGE
    const updateData: UpdateTodoData = { title: 'Updated Title' };
    const updatedTodo = { ...mockTodo, title: 'Updated Title' };
    vi.mocked(updateTodo).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(updatedTodo), 100))
    );

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({ id: '1', data: updateData });

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const mockError = new Error('Failed to update todo');
    vi.mocked(updateTodo).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: '1', data: { title: 'Updated' } });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should update multiple fields at once', async () => {
    // ARRANGE
    const updateData: UpdateTodoData = {
      title: 'Updated Title',
      description: 'Updated Description',
      completed: true,
    };
    const updatedTodo = { ...mockTodo, ...updateData };
    vi.mocked(updateTodo).mockResolvedValue(updatedTodo);

    // ACT
    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: '1', data: updateData });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(updateTodo).toHaveBeenCalledWith('1', updateData);
    expect(result.current.data).toEqual(updatedTodo);
  });
});
