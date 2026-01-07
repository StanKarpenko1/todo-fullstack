import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, registerUser, forgotPassword, resetPassword } from './authApi';
import { apiClient } from '@shared/api/apiClient';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';

// Mock apiClient
vi.mock('@shared/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should call POST /auth/login with credentials', async () => {
      // ARRANGE
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        token: 'jwt-token-123',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // ACT
      const result = await loginUser(credentials);

      // ASSERT
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when login fails', async () => {
      // ARRANGE
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        password: 'wrongpass',
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid credentials'));

      // ACT & ASSERT
      await expect(loginUser(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('registerUser', () => {
    it('should call POST /auth/register with user data', async () => {
      // ARRANGE
      const userData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        token: 'jwt-token-456',
        user: {
          id: '2',
          email: 'new@example.com',
          name: 'New User',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // ACT
      const result = await registerUser(userData);

      // ASSERT
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when registration fails', async () => {
      // ARRANGE
      const userData: RegisterData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Email already exists'));

      // ACT & ASSERT
      await expect(registerUser(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('forgotPassword', () => {
    it('should call POST /auth/forgot-password with email', async () => {
      // ARRANGE
      const email = 'test@example.com';
      const mockResponse = { message: 'Reset email sent' };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // ACT
      const result = await forgotPassword(email);

      // ASSERT
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should call POST /auth/reset-password with token and new password', async () => {
      // ARRANGE
      const token = 'reset-token-123';
      const password = 'newPassword123';
      const mockResponse = { message: 'Password reset successful' };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // ACT
      const result = await resetPassword(token, password);

      // ASSERT
      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', { token, password });
      expect(result).toEqual(mockResponse);
    });
  });
});
