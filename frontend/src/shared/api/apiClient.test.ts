import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Mock axios BEFORE importing apiClient
vi.mock('axios', () => {
  const mockAxiosInstance = {
    defaults: {},
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// NOW import apiClient (after mock is set up)
const { apiClient } = await import('./apiClient');

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear location.href mock
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should create axios instance with correct baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should attach authorization token when token exists', () => {
    // ARRANGE
    const mockToken = 'test-token-123';
    localStorage.setItem('token', mockToken);

    const requestInterceptor = vi.mocked(apiClient.interceptors.request.use).mock.calls[0]?.[0];
    if (!requestInterceptor) throw new Error('Request interceptor not found');

    const mockConfig: InternalAxiosRequestConfig = {
      url: '/todos',
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    // ACT
    const result = requestInterceptor(mockConfig) as InternalAxiosRequestConfig;

    // ASSERT
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('should NOT attach authorization token when token does not exist', () => {
    // ARRANGE - no token in localStorage
    const requestInterceptor = vi.mocked(apiClient.interceptors.request.use).mock.calls[0]?.[0];
    if (!requestInterceptor) throw new Error('Request interceptor not found');

    const mockConfig: InternalAxiosRequestConfig = {
      url: '/todos',
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    // ACT
    const result = requestInterceptor(mockConfig) as InternalAxiosRequestConfig;

    // ASSERT
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should remove token and redirect to login on 401 error', async () => {
    // ARRANGE
    localStorage.setItem('token', 'expired-token');

    const responseInterceptor = vi.mocked(apiClient.interceptors.response.use).mock.calls[0]?.[1];
    if (!responseInterceptor) throw new Error('Response error interceptor not found');

    const mockError: Partial<AxiosError> = {
      response: {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      },
    };

    // ACT & ASSERT
    await expect(responseInterceptor(mockError as AxiosError)).rejects.toEqual(mockError);

    // Verify token removed
    expect(localStorage.getItem('token')).toBeNull();

    // Verify redirect
    expect(window.location.href).toBe('/login');
  });
});
