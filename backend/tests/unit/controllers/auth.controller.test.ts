/**
 * Unit Tests for Auth Controller
 *
 * TDD Principles Applied:
 * - All external dependencies are mocked (Prisma, bcrypt, JWT)
 * - Tests focus on business logic only
 * - Fast execution (no database, no network)
 * - Each test is independent and isolated
 * - Follows AAA pattern: Arrange, Act, Assert
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login } from '../../../src/controllers/auth.controller';
import {
  createMockRequest,
  createMockResponse,
  createMockUser,
  setupTestEnv,
  suppressConsoleError,
} from '../setup';

// Mock all external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock Prisma Client - must define mocks inside the factory function
jest.mock('@prisma/client', () => {
  const mockPrismaUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: mockPrismaUser,
    })),
    mockPrismaUser, // Export for test access
  };
});

// Import the mock for test access
const { mockPrismaUser } = require('@prisma/client') as any;

describe('Auth Controller - Unit Tests', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    // Setup test environment
    setupTestEnv();

    req = createMockRequest();
    res = createMockResponse();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register()', () => {
    describe('successful registration', () => {
      it('should register new user and return user data with token', async () => {
        // ARRANGE
        const requestBody = {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        };
        req.body = requestBody;

        const mockUser = createMockUser({
          id: 'new-user-id',
          email: requestBody.email,
          name: requestBody.name,
        });

        // Mock: No existing user (email available)
        mockPrismaUser.findUnique.mockResolvedValue(null);

        // Mock: Password hashing
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password-123');

        // Mock: User creation
        mockPrismaUser.create.mockResolvedValue(mockUser);

        // Mock: JWT generation
        (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

        // ACT
        await register(req, res);

        // ASSERT
        expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
          where: { email: requestBody.email },
        });
        expect(bcrypt.hash).toHaveBeenCalledWith(requestBody.password, 12);
        expect(mockPrismaUser.create).toHaveBeenCalledWith({
          data: {
            email: requestBody.email,
            password: 'hashed-password-123',
            name: requestBody.name,
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });
        expect(jwt.sign).toHaveBeenCalledWith(
          { userId: mockUser.id },
          'test-secret-key',
          { expiresIn: '1h' }
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'User registered successfully',
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
          }),
          token: 'mock-jwt-token',
        });
      });

      it('should register user without name (optional field)', async () => {
        // ARRANGE
        const requestBody = {
          email: 'newuser@example.com',
          password: 'password123',
        };
        req.body = requestBody;

        mockPrismaUser.findUnique.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
        mockPrismaUser.create.mockResolvedValue(
          createMockUser({ email: requestBody.email, name: null })
        );
        (jwt.sign as jest.Mock).mockReturnValue('token');

        // ACT
        await register(req, res);

        // ASSERT
        expect(mockPrismaUser.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              email: requestBody.email,
              name: undefined,
            }),
          })
        );
        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe('validation errors', () => {
      it('should return 400 when email is missing', async () => {
        // ARRANGE
        req.body = { password: 'password123' };

        // ACT
        await register(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: expect.stringContaining('email'),
        });
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should return 400 when email is invalid', async () => {
        // ARRANGE
        req.body = { email: 'not-an-email', password: 'password123' };

        // ACT
        await register(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: expect.stringContaining('valid email'),
        });
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should return 400 when password is missing', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };

        // ACT
        await register(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: expect.stringContaining('password'),
        });
      });

      it('should return 400 when password is too short (< 6 characters)', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: '12345' };

        // ACT
        await register(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: expect.stringContaining('6'),
        });
      });
    });

    describe('business logic errors', () => {
      it('should return 400 when user already exists', async () => {
        // ARRANGE
        req.body = {
          email: 'existing@example.com',
          password: 'password123',
        };

        // Mock: User already exists
        mockPrismaUser.findUnique.mockResolvedValue(
          createMockUser({ email: 'existing@example.com' })
        );

        // ACT
        await register(req, res);

        // ASSERT
        expect(mockPrismaUser.findUnique).toHaveBeenCalled();
        expect(mockPrismaUser.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'User already exists with this email',
        });
      });
    });

    describe('error handling', () => {
      it('should return 500 when database throws error', async () => {
        // ARRANGE
        req.body = {
          email: 'user@example.com',
          password: 'password123',
        };

        // Mock: Database error
        mockPrismaUser.findUnique.mockRejectedValue(
          new Error('Database connection failed')
        );

        const consoleSpy = suppressConsoleError();

        // ACT
        await register(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it('should return 500 when bcrypt throws error', async () => {
        // ARRANGE
        req.body = {
          email: 'user@example.com',
          password: 'password123',
        };

        mockPrismaUser.findUnique.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockRejectedValue(
          new Error('Hashing failed')
        );

        const consoleSpy = suppressConsoleError();

        // ACT
        await register(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Internal server error',
        });

        consoleSpy.mockRestore();
      });
    });
  });

  describe('login()', () => {
    describe('successful login', () => {
      it('should authenticate user and return token', async () => {
        // ARRANGE
        const requestBody = {
          email: 'user@example.com',
          password: 'password123',
        };
        req.body = requestBody;

        const mockUser = createMockUser({
          email: requestBody.email,
          password: 'hashed-password',
        });

        // Mock: User exists
        mockPrismaUser.findUnique.mockResolvedValue(mockUser);

        // Mock: Password is correct
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        // Mock: JWT generation
        (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

        // ACT
        await login(req, res);

        // ASSERT
        expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
          where: { email: requestBody.email },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          requestBody.password,
          mockUser.password
        );
        expect(jwt.sign).toHaveBeenCalledWith(
          { userId: mockUser.id },
          'test-secret-key',
          { expiresIn: '1h' }
        );
        expect(res.json).toHaveBeenCalledWith({
          message: 'Login successful',
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
          },
          token: 'mock-jwt-token',
        });
      });

      it('should not expose password in response', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'password123' };
        const mockUser = createMockUser();

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('token');

        // ACT
        await login(req, res);

        // ASSERT
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.not.objectContaining({
              password: expect.anything(),
            }),
          })
        );
      });
    });

    describe('validation errors', () => {
      it('should return 400 when email is missing', async () => {
        // ARRANGE
        req.body = { password: 'password123' };

        // ACT
        await login(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: expect.stringContaining('email'),
        });
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should return 400 when password is missing', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };

        // ACT
        await login(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: expect.stringContaining('password'),
        });
      });

      it('should return 400 when email is invalid format', async () => {
        // ARRANGE
        req.body = { email: 'invalid-email', password: 'password123' };

        // ACT
        await login(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });
    });

    describe('authentication failures', () => {
      it('should return 400 when user does not exist', async () => {
        // ARRANGE
        req.body = { email: 'nonexistent@example.com', password: 'password123' };

        // Mock: User not found
        mockPrismaUser.findUnique.mockResolvedValue(null);

        // ACT
        await login(req, res);

        // ASSERT
        expect(mockPrismaUser.findUnique).toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Invalid email or password',
        });
      });

      it('should return 400 when password is incorrect', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'wrong-password' };
        const mockUser = createMockUser();

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);

        // Mock: Password comparison fails
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // ACT
        await login(req, res);

        // ASSERT
        expect(bcrypt.compare).toHaveBeenCalledWith(
          'wrong-password',
          mockUser.password
        );
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Invalid email or password',
        });
      });

      it('should use same error message for non-existent user and wrong password (security)', async () => {
        // ARRANGE - Non-existent user
        req.body = { email: 'fake@example.com', password: 'password' };
        mockPrismaUser.findUnique.mockResolvedValue(null);

        // ACT
        await login(req, res);

        // ASSERT
        const nonExistentError = (res.json as jest.Mock).mock.calls[0][0].error;

        // Reset
        jest.clearAllMocks();
        res = createMockResponse();

        // ARRANGE - Wrong password
        req.body = { email: 'user@example.com', password: 'wrong' };
        mockPrismaUser.findUnique.mockResolvedValue(createMockUser());
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // ACT
        await login(req, res);

        // ASSERT
        const wrongPasswordError = (res.json as jest.Mock).mock.calls[0][0]
          .error;
        expect(nonExistentError).toBe(wrongPasswordError);
      });
    });

    describe('error handling', () => {
      it('should return 500 when database throws error', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'password123' };

        mockPrismaUser.findUnique.mockRejectedValue(
          new Error('Database error')
        );

        const consoleSpy = suppressConsoleError();

        // ACT
        await login(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Internal server error',
        });

        consoleSpy.mockRestore();
      });

      it('should return 500 when bcrypt throws error', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'password123' };
        const mockUser = createMockUser();

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockRejectedValue(
          new Error('Bcrypt error')
        );

        const consoleSpy = suppressConsoleError();

        // ACT
        await login(req, res);

        // ASSERT
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Internal server error',
        });

        consoleSpy.mockRestore();
      });
    });
  });
});
