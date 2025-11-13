
import { Request, Response } from 'express';

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