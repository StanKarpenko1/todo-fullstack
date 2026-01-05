import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios, { type InternalAxiosRequestConfig } from 'axios';

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
    // Don't clear mocks - they're set during module import
    localStorage.clear();
  });

  it('should create axios instance with correct baseURL', () => {
    // ASSERT - axios.create was called during module import
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should attach authorization token to requests if token exists', () => {
    // ARRANGE
    const mockToken = 'test-token-123';
    localStorage.setItem('token', mockToken);

    // Get the request interceptor function (first argument of first call)
    const requestInterceptor = vi.mocked(apiClient.interceptors.request.use).mock.calls[0]?.[0];

    // Type guard
    if (!requestInterceptor) {
      throw new Error('Request interceptor not found');
    }

    const mockConfig: InternalAxiosRequestConfig = {
      url: '/api/todos', // ← Add URL that starts with /api
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    // ACT
    const result = requestInterceptor(mockConfig) as InternalAxiosRequestConfig;

    // ASSERT
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('should NOT attach authorization header if token does not exist', () => {
    // ARRANGE - no token in localStorage
    localStorage.removeItem('token');

    // Get the request interceptor function
    const requestInterceptor = vi.mocked(apiClient.interceptors.request.use).mock.calls[0]?.[0];

    // Type guard
    if (!requestInterceptor) {
      throw new Error('Request interceptor not found');
    }

    const mockConfig: InternalAxiosRequestConfig = {
      url: '/api/todos', // ← Add URL
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    // ACT
    const result = requestInterceptor(mockConfig) as InternalAxiosRequestConfig;

    // ASSERT
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should NOT attach authorization header to external URLs', () => {
    // ARRANGE
    const mockToken = 'test-token-123';
    localStorage.setItem('token', mockToken);

    // Get the request interceptor function
    const requestInterceptor = vi.mocked(apiClient.interceptors.request.use).mock.calls[0]?.[0];

    // Type guard
    if (!requestInterceptor) {
      throw new Error('Request interceptor not found');
    }

    const mockConfig: InternalAxiosRequestConfig = {
      url: 'https://external-analytics.com/track', // ← External URL
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    // ACT
    const result = requestInterceptor(mockConfig) as InternalAxiosRequestConfig;

    // ASSERT - Token should NOT be added to external requests
    expect(result.headers.Authorization).toBeUndefined();
  });
});
