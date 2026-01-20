import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodos } from './useTodos';
import { getTodos } from '../api/todosApi';
import { type ReactNode } from 'react';
import type { Todo } from '../types/todo.types';

// Mock todosApi
vi.mock('../api/todosApi');

describe('useTodos', () => {
  let queryClient: QueryClient;

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Description 1',
      completed: false,
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: null,
      completed: true,
      userId: 'user-1',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

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

  it('should fetch todos successfully', async () => {
    // ARRANGE
    vi.mocked(getTodos).mockResolvedValue(mockTodos);

    // ACT
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getTodos).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockTodos);
  });

  it('should return empty array when no todos exist', async () => {
    // ARRANGE
    vi.mocked(getTodos).mockResolvedValue([]);

    // ACT
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should show loading state while fetching', async () => {
    // ARRANGE
    vi.mocked(getTodos).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTodos), 100))
    );

    // ACT
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    // ASSERT - initial state
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const mockError = new Error('Failed to fetch todos');
    vi.mocked(getTodos).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should use correct query key', async () => {
    // ARRANGE
    vi.mocked(getTodos).mockResolvedValue(mockTodos);

    // ACT
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ASSERT - verify query is cached with correct key
    const cachedData = queryClient.getQueryData(['todos']);
    expect(cachedData).toEqual(mockTodos);
  });
});
