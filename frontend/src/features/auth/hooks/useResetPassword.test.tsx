import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResetPassword } from './useResetPassword';
import { resetPassword } from '../api/authApi';
import { type ReactNode } from 'react';

// Mock dependencies
vi.mock('../api/authApi');

describe('useResetPassword', () => {
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

  it('should call resetPassword API on mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockData = {
      token: 'valid-reset-token',
      password: 'newPassword123',
    };
    const mockResponse = { message: 'Password reset successful' };

    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useResetPassword(), { wrapper });
    result.current.mutate(mockData);

    // ASSERT
    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith(mockData.token, mockData.password);
    });
  });

  it('should return success message on successful mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockData = {
      token: 'valid-reset-token',
      password: 'newPassword123',
    };
    const mockResponse = { message: 'Password reset successful' };

    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useResetPassword(), { wrapper });
    result.current.mutate(mockData);

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  it('should return loading state during mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    vi.mocked(resetPassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    // ACT
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({ token: 'valid-token', password: 'newPassword123' });

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors (invalid token)', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockError = new Error('Invalid or expired reset token');
    vi.mocked(resetPassword).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useResetPassword(), { wrapper });
    result.current.mutate({ token: 'invalid-token', password: 'newPassword123' });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should handle API errors (weak password)', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockError = new Error('Password must be at least 6 characters');
    vi.mocked(resetPassword).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useResetPassword(), { wrapper });
    result.current.mutate({ token: 'valid-token', password: '123' });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should NOT call AuthContext (no auto-login after reset)', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockResponse = { message: 'Password reset successful' };
    vi.mocked(resetPassword).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useResetPassword(), { wrapper });
    result.current.mutate({ token: 'valid-token', password: 'newPassword123' });

    // ASSERT - just verify success, no login happens
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    // No AuthContext.login should be called (user must login manually after reset)
  });
});
