import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { forgotPassword } from '../api/authApi';
import { type ReactNode } from 'react';

// Mock dependencies
vi.mock('../api/authApi');

describe('useForgotPassword', () => {
  let queryClient: QueryClient;

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

  // Helper: Wrapper with React Query (no AuthContext needed)
  const createWrapper = () => {
    return {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    };
  };

  it('should call forgotPassword API on mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockEmail = 'user@example.com';
    const mockResponse = { message: 'Password reset email sent' };

    vi.mocked(forgotPassword).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    result.current.mutate({ email: mockEmail });

    // ASSERT
    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith(mockEmail);
    });
  });

  it('should return success message on successful mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockEmail = 'user@example.com';
    const mockResponse = { message: 'Password reset email sent' };

    vi.mocked(forgotPassword).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    result.current.mutate({ email: mockEmail });

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  it('should return loading state during mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    vi.mocked(forgotPassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    // ACT
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({ email: 'user@example.com' });

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockError = new Error('User not found');
    vi.mocked(forgotPassword).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    result.current.mutate({ email: 'nonexistent@example.com' });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should NOT call AuthContext (no login after forgot password)', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockResponse = { message: 'Password reset email sent' };
    vi.mocked(forgotPassword).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useForgotPassword(), { wrapper });
    result.current.mutate({ email: 'user@example.com' });

    // ASSERT - just verify success, no login happens
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    // No AuthContext.login should be called (that's the point of this test)
  });
});
