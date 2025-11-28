
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
import { register, login, forgotPassword, resetPassword } from '../../../src/controllers/auth.controller';
import {
  createMockRequest,
  createMockResponse,
  createMockUser,
  setupTestEnv,
} from '../setup';
import crypto from 'crypto';

// Mock all external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

// Mock Prisma Client - must define mocks inside the factory function
jest.mock('@prisma/client', () => {
  const mockPrismaUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn()
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
      it('should throw AppError when email is missing', async () => {
        // ARRANGE
        req.body = { password: 'password123' };

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('"email" is required');
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should throw AppError when email is invalid', async () => {
        // ARRANGE
        req.body = { email: 'not-an-email', password: 'password123' };

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('valid email');
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should throw AppError when password is missing', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('"password" is required');
      });

      it('should throw AppError when password is too short (< 6 characters)', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: '12345' };

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('at least 6 characters');
      });
    });

    describe('business logic errors', () => {
      it('should throw AppError when user already exists', async () => {
        // ARRANGE
        req.body = {
          email: 'existing@example.com',
          password: 'password123',
        };

        // Mock: User already exists
        mockPrismaUser.findUnique.mockResolvedValue(
          createMockUser({ email: 'existing@example.com' })
        );

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('User already exists with this email');
        expect(mockPrismaUser.findUnique).toHaveBeenCalled();
        expect(mockPrismaUser.create).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error when database throws error', async () => {
        // ARRANGE
        req.body = {
          email: 'user@example.com',
          password: 'password123',
        };

        // Mock: Database error
        mockPrismaUser.findUnique.mockRejectedValue(
          new Error('Database connection failed')
        );

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('Database connection failed');
      });

      it('should throw error when bcrypt throws error', async () => {
        // ARRANGE
        req.body = {
          email: 'user@example.com',
          password: 'password123',
        };

        mockPrismaUser.findUnique.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockRejectedValue(
          new Error('Hashing failed')
        );

        // ACT & ASSERT
        await expect(register(req, res)).rejects.toThrow('Hashing failed');
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
      it('should throw AppError when email is missing', async () => {
        // ARRANGE
        req.body = { password: 'password123' };

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('"email" is required');
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should throw AppError when password is missing', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('"password" is required');
      });

      it('should throw AppError when email is invalid format', async () => {
        // ARRANGE
        req.body = { email: 'invalid-email', password: 'password123' };

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('valid email');
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });
    });

    describe('authentication failures', () => {
      it('should throw AppError when user does not exist', async () => {
        // ARRANGE
        req.body = { email: 'nonexistent@example.com', password: 'password123' };

        // Mock: User not found
        mockPrismaUser.findUnique.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('Invalid email or password');
        expect(mockPrismaUser.findUnique).toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
      });

      it('should throw AppError when password is incorrect', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'wrong-password' };
        const mockUser = createMockUser();

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);

        // Mock: Password comparison fails
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('Invalid email or password');
        expect(bcrypt.compare).toHaveBeenCalledWith(
          'wrong-password',
          mockUser.password
        );
        expect(jwt.sign).not.toHaveBeenCalled();
      });

      it('should use same error message for non-existent user and wrong password (security)', async () => {
        // ARRANGE - Non-existent user
        req.body = { email: 'fake@example.com', password: 'password' };
        mockPrismaUser.findUnique.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('Invalid email or password');
        const firstErrorMessage = 'Invalid email or password';

        // Reset
        jest.clearAllMocks();

        // ARRANGE - Wrong password
        req.body = { email: 'user@example.com', password: 'wrong' };
        mockPrismaUser.findUnique.mockResolvedValue(createMockUser());
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('Invalid email or password');
        const secondErrorMessage = 'Invalid email or password';
        expect(firstErrorMessage).toBe(secondErrorMessage);
      });
    });

    describe('error handling', () => {
      it('should throw error when database throws error', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'password123' };

        mockPrismaUser.findUnique.mockRejectedValue(
          new Error('Database error')
        );

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('Database error');
      });

      it('should throw error when bcrypt throws error', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com', password: 'password123' };
        const mockUser = createMockUser();

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockRejectedValue(
          new Error('Bcrypt error')
        );

        // ACT & ASSERT
        await expect(login(req, res)).rejects.toThrow('Bcrypt error');
      });
    });
  });

  describe('forgotPassword()', () => {
    const RESET_SUCCESS_MESSAGE = 'Reset link has been sent';

    describe('successful token generation', () => {
      it('should generate reset token for existing user', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };
        const mockUser = createMockUser({ email: 'user@example.com' });
        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from('a'.repeat(32)));
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token-123');

        //ACT
        await forgotPassword(req, res)

        //ASSERT
        expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
          where: { email: req.body.email },
        });
        expect(crypto.randomBytes).toHaveBeenCalledWith(32);
        expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            resetToken: 'hashed-token-123',
            resetTokenExpires: expect.any(Date)
          }
        });
        expect(res.json).toHaveBeenCalledWith({
          message: RESET_SUCCESS_MESSAGE,
          resetToken: expect.any(String)
        });

      });

      it('should hash token before storing in DB', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };
        const plainToken = 'plain-token-abc123';
        const mockUser = createMockUser({ email: 'user@example.com' });

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (crypto.randomBytes as jest.Mock).mockReturnValue({
          toString: jest.fn().mockReturnValue(plainToken)
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token-xyz');

        // ACT
        await forgotPassword(req, res);

        // ASSERT
        expect(bcrypt.hash).toHaveBeenCalledWith(plainToken, 10);
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            resetToken: 'hashed-token-xyz',  // Hashed version stored
            resetTokenExpires: expect.any(Date)
          }
        });
      });

      it('should set expiry to 1 hour from now', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };
        const mockUser = createMockUser({ email: 'user@example.com' });
        const now = Date.now();
        const oneHourFromNow = new Date(now + 3600000); // 3600000ms = 1 hour 

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from('a'.repeat(32)));
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
        jest.spyOn(Date, 'now').mockReturnValue(now);

        // ACT
        await forgotPassword(req, res);

        //ASSERT
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            resetToken: expect.any(String),
            resetTokenExpires: oneHourFromNow
          }
        });
      });

      it('should return reset token in response', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };
        const mockUser = createMockUser({ email: 'user@example.com' });
        const plainToken = 'plain-token-abc123';

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (crypto.randomBytes as jest.Mock).mockReturnValue({
          toString: jest.fn().mockReturnValue(plainToken)
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token-xyz');

        // ACT
        await forgotPassword(req, res);

        //ASSERT
        expect(res.json).toHaveBeenCalledWith({
          message: RESET_SUCCESS_MESSAGE,
          resetToken: plainToken  // Plain token sent to user
        });
      });

      it('should return generic message for non-existent email (security)', async () => {
        // ARRANGE
        req.body = { email: 'nonexistent@example.com' };
        mockPrismaUser.findUnique.mockResolvedValue(null); // User doesn't exist

        // ACT
        await forgotPassword(req, res);

        //ASSERT
        expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
          where: { email: 'nonexistent@example.com' }
        });
        expect(mockPrismaUser.update).not.toHaveBeenCalled(); // No DB update
        expect(res.json).toHaveBeenCalledWith({
          message: RESET_SUCCESS_MESSAGE
        });
      });
    });

    describe('validation errors', () => {
      it('should reject missing email', async () => {
        // ARRANGE
        req.body = {};

        // ACT & ASSERT
        await expect(forgotPassword(req, res)).rejects.toThrow('Email is required');
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });

      it('should reject invalid email format', async () => {
        // ARRANGE
        req.body = { email: 'not-an-email' }; // Invalid format

        // ACT & ASSERT
        await expect(forgotPassword(req, res)).rejects.toThrow('Please provide a valid email address');
        expect(mockPrismaUser.findUnique).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle database error during user lookup', async () => {

        req.body = { email: 'user@example.com' }

        mockPrismaUser.findUnique.mockRejectedValue(
          new Error('Database connection failed')
        );

        await expect(forgotPassword(req, res)).rejects.toThrow('Database connection failed')
      });

      it('should handle database error during token update', async () => {
        // ARRANGE
        req.body = { email: 'user@example.com' };
        const mockUser = createMockUser({ email: 'user@example.com' });

        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from('a'.repeat(32)));
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
        mockPrismaUser.update.mockRejectedValue(
          new Error('Failed to update user')
        );

        // ACT & ASSERT
        await expect(forgotPassword(req, res)).rejects.toThrow('Failed to update user');

      });
    });
  });

  describe('resetPassword()', () => {
    describe('successful password reset', () => {
      it('should reset password with valid token', async () => {
        // ARRANGE
        req.body = { token: 'valid-token-123', newPassword: 'newPass123' };
        const mockUser = createMockUser({
          id: 'user-id',
          email: 'user@example.com',
          resetToken: 'hashed-token-abc',
          resetTokenExpires: new Date(Date.now() + 3600000) // Not expired
        });

        mockPrismaUser.findFirst.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Token matches 
        (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password-xyz');
         mockPrismaUser.update.mockResolvedValue(mockUser);

        // ACT 
        await resetPassword(req, res);

        // ASSERT
        expect(mockPrismaUser.findFirst).toHaveBeenCalledWith({
          where: {
            resetToken: { not: null },
            resetTokenExpires: { gt: expect.any(Date) }
          }
        });
        expect(bcrypt.compare).toHaveBeenCalledWith('valid-token-123', 'hashed-token-abc');
        expect(bcrypt.hash).toHaveBeenCalledWith('newPass123', 12);
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: 'user-id' },
          data: {
            password: 'new-hashed-password-xyz',
            resetToken: null,
            resetTokenExpires: null
          }
        });
        expect(res.json).toHaveBeenCalledWith({
          message: 'Password reset successful'
        });
      });

      it('should hash new password before storing', async () => {
        // ARRANGE
        req.body = { token: 'valid-token', newPassword: 'myNewPassword123' };

        const mockUser = createMockUser({
          id: 'user-id',
          resetToken: 'hashed-token',
          resetTokenExpires: new Date(Date.now() + 3600000)
        });

        mockPrismaUser.findFirst.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
        mockPrismaUser.update.mockResolvedValue(mockUser);

        // ACT
        await resetPassword(req, res);

        // ASSERT
        expect(bcrypt.hash).toHaveBeenCalledWith('myNewPassword123', 12);
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: 'user-id' },
          data: {
            password: 'new-hashed-password', // Hashed version stored
            resetToken: null,
            resetTokenExpires: null
          }
        });
      });

      it('should clear reset token after successful reset', async () => {
        // ARRANGE
        req.body = { token: 'valid-token', newPassword: 'newPass123' };
        const mockUser = createMockUser({
          id: 'user-id',
          resetToken: 'hashed-token',
          resetTokenExpires: new Date(Date.now() + 3600000)
        });

        mockPrismaUser.findFirst.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

        // ACT
        await resetPassword(req, res);

        // ASSERT
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: 'user-id' },
          data: {
            password: expect.any(String),
            resetToken: null,  // Token cleared (single-use)
            resetTokenExpires: null
          }
        });
      });

      it('should clear reset token expiry after successful reset', async () => {

        // ARRANGE
        req.body = { token: 'valid-token', newPassword: 'newPass123' };
        const mockUser = createMockUser({
          id: 'user-id',
          resetToken: 'hashed-token',
          resetTokenExpires: new Date(Date.now() + 3600000)
        });

        mockPrismaUser.findFirst.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

        // ACT
        await resetPassword(req, res);

        // ASSERT
        expect(mockPrismaUser.update).toHaveBeenCalledWith({
          where: { id: 'user-id' },
          data: {
            password: expect.any(String),
            resetToken: null,
            resetTokenExpires: null // Expiry cleared
          }
        });
      });
    });

    describe('validation errors', () => {
      it('should reject missing token', async () => {
        // ARRANGE
        req.body = { newPassword: 'newPass123' }; // Token missing

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Reset token is required');
        expect(mockPrismaUser.findFirst).not.toHaveBeenCalled();
      });

      it('should reject missing password', async () => {
        // ARRANGE
        req.body = { token: 'valid-token' }; // Password missing

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('New password is required');
        expect(mockPrismaUser.findFirst).not.toHaveBeenCalled();
      });

      it('should reject password too short (<6 characters)', async () => {
        // ARRANGE
        req.body = { token: 'valid-token', newPassword: '12345' }; // Only 5 chars

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Password must be at least 6 characters long');
        expect(mockPrismaUser.findFirst).not.toHaveBeenCalled();
      });
    });

    describe('authentication failures', () => {
      it('should reject expired token (>1 hour old)', async () => {
        // ARRANGE
        req.body = { token: 'valid-token', newPassword: 'newPass123' };

        // Mock: No user found (token expired, filtered out by gt query)
        mockPrismaUser.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Invalid or expired reset token');
        expect(mockPrismaUser.findFirst).toHaveBeenCalledWith({
          where: {
            resetToken: { not: null },
            resetTokenExpires: { gt: expect.any(Date) }
          }
        });
        expect(bcrypt.compare).not.toHaveBeenCalled();
      });

      it('should reject invalid token (not found in DB)', async () => {
        // ARRANGE
        req.body = { token: 'non-existent-token', newPassword: 'newPass123' };

        // Mock: No user with reset token
        mockPrismaUser.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Invalid or expired reset token');
        expect(mockPrismaUser.findFirst).toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
      });

      it('should reject token that does not match hash', async () => {
        // ARRANGE
        req.body = { token: 'wrong-token', newPassword: 'newPass123' };
        const mockUser = createMockUser({
          resetToken: 'hashed-token-abc',
          resetTokenExpires: new Date(Date.now() + 3600000)
        });

        mockPrismaUser.findFirst.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Token doesn't match      

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Invalid or expired reset token');
        expect(bcrypt.compare).toHaveBeenCalledWith('wrong-token', 'hashed-token-abc');
        expect(mockPrismaUser.update).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle database error during token lookup', async () => {
        // ARRANGE
        req.body = { token: 'valid-token', newPassword: 'newPass123' };

        mockPrismaUser.findFirst.mockRejectedValue(
          new Error('Database connection failed')
        );

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Database connection failed');
      });

      it('should handle database error during password update', async () => {
        // ARRANGE
        req.body = { token: 'valid-token', newPassword: 'newPass123' };
        const mockUser = createMockUser({
          resetToken: 'hashed-token',
          resetTokenExpires: new Date(Date.now() + 3600000)
        });

        mockPrismaUser.findFirst.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
        mockPrismaUser.update.mockRejectedValue(
          new Error('Failed to update password')
        );

        // ACT & ASSERT
        await expect(resetPassword(req, res)).rejects.toThrow('Failed to update password');
      });
    });
  });
});
