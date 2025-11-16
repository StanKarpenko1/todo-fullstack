/**
 * Unit Test Setup - Mock Factories and Test Utilities
 *
 * This file provides:
 * - Mock factories for creating test data
 * - Type-safe mocks for external dependencies
 * - Shared test utilities for TDD
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/auth';

/**
 * Mock Express Response object with Jest spies
 * This allows us to verify controller behavior without HTTP server
 */
export const createMockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock Express NextFunction for error handling
 */
export const createMockNext = (): NextFunction => {
  return jest.fn() as NextFunction;
};

/**
 * Mock Express Request object
 */
export const createMockRequest = (data: Partial<Request> = {}): Request => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...data,
  } as Request;
};

/**
 * Mock Authenticated Request with user context
 */
export const createMockAuthRequest = (
  data: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ...data,
  } as AuthenticatedRequest;
};

/**
 * Test Data Factories
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'user@example.com',
  password: 'hashed-password-123',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockTodo = (overrides = {}) => ({
  id: 'todo-123',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  userId: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * Environment variable setup for tests
 */
export const setupTestEnv = () => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
};

/**
 * Console spy to suppress error logs in tests
 */
export const suppressConsoleError = () => {
  return jest.spyOn(console, 'error').mockImplementation(() => {});
};
