import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegister } from './useRegister';
import { registerUser } from '../api/authApi';
import { useAuth } from '@/shared/contexts/AuthContext';
import { type ReactNode } from 'react';

// Mock dependencies
vi.mock('../api/authApi');
vi.mock('@/shared/contexts/AuthContext');

describe('useRegister', () => {
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

  it('should call registerUser API on mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    };
    const mockResponse = {
      token: 'mock-token',
      user: { id: '1', email: 'newuser@example.com', name: 'New User' },
    };

    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useRegister(), { wrapper });
    result.current.mutate(mockData);

    // ASSERT
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call AuthContext.login on success (auto-login)', async () => {
    // ARRANGE
    const { wrapper, mockLogin } = createWrapper();
    const mockData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    };
    const mockResponse = {
      token: 'mock-token',
      user: { id: '1', email: 'newuser@example.com', name: 'New User' },
    };

    vi.mocked(registerUser).mockResolvedValue(mockResponse);

    // ACT
    const { result } = renderHook(() => useRegister(), { wrapper });
    result.current.mutate(mockData);

    // ASSERT
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.token, mockResponse.user);
    });
  });

  it('should return loading state during mutation', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    vi.mocked(registerUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    // ACT
    const { result } = renderHook(() => useRegister(), { wrapper });

    // Initial state - not pending
    expect(result.current.isPending).toBe(false);

    // Trigger mutation
    result.current.mutate({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    });

    // ASSERT - isPending should be true after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('should handle API errors', async () => {
    // ARRANGE
    const { wrapper } = createWrapper();
    const mockError = new Error('Email already exists');
    vi.mocked(registerUser).mockRejectedValue(mockError);

    // ACT
    const { result } = renderHook(() => useRegister(), { wrapper });
    result.current.mutate({
      email: 'existing@example.com',
      password: 'password123',
      name: 'User'
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });
});
