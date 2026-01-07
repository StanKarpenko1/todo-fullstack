import { apiClient } from '@shared/api/apiClient';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';

/**
 * Login user
 * @param credentials - Email and password
 * @returns Auth response with token and user data
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data;
};

/**
 * Register new user
 * @param userData - Name, email, and password
 * @returns Auth response with token and user data
 */
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
  return data;
};

/**
 * Request password reset email
 * @param email - User's email address
 * @returns Success message
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
};

/**
 * Reset password with token
 * @param token - Reset token from email
 * @param password - New password
 * @returns Success message
 */
export const resetPassword = async (
  token: string,
  password: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    password,
  });
  return data;
};
