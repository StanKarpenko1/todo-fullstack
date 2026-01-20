import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './useLogin';
import { loginUser } from '../api/authApi';
import { useAuth } from '@/shared/contexts/AuthContext';
import { type ReactNode } from 'react';

// Mock dependencies
vi.mock('../api/authApi');
vi.mock('@/shared/contexts/AuthContext');

describe('useLogin', () => {
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

  // Helper: Wrapper with React Query + AuthContext
  const createWrapper = () => {
    const mockLogin = vi.fn();
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
      mockLogin,
    };
  };

  it('should call loginUser API on mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    const mockResponse = {
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    };

    vi.mocked(loginUser).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate(mockCredentials);

    // ASSERT
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith(mockCredentials);
    });
  });

  it('should call AuthContext.login on success', async () => {
    // ARRANGE
    const { wrapper, mockLogin } = createWrapper();
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    const mockResponse = {
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    };

    vi.mocked(loginUser).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate(mockCredentials);

    // ASSERT
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.token, mockResponse.user);
    });
  });

  it('should return loading state during mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    vi.mocked(loginUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    // ACT
    const { result } = renderHook(() => useLogin(), { wrapper });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({ email: 'test@example.com', password: 'password123' });

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockError = new Error('Invalid credentials');
    vi.mocked(loginUser).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: 'test@example.com', password: 'wrong' });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });
});
