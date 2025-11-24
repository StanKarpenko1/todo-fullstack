import { Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../../../src/middleware/auth';
import { AppError } from '../../../src/middleware/errorHandler';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createMockResponse, setupTestEnv } from '../setup';

// Mock external dependencies
jest.mock('@prisma/client', () => {
    const mockPrismaUser = {
        findUnique: jest.fn(),
    };

    return {
        PrismaClient: jest.fn(() => ({
            user: mockPrismaUser,
        })),
    };
});

jest.mock('jsonwebtoken');

// Setup
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const prisma = new PrismaClient();
const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe('authenticateToken middleware', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        setupTestEnv();
        jest.clearAllMocks();

        req = {
            headers: {},
        };
        res = createMockResponse();
        next = jest.fn();
    });

    describe('successful authentication', () => {
        it('should authenticate valid token and attach user to req.user', async () => {
            // ARRANGE
            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                name: 'Test User',
            } as any; // Cast to satisfy Prisma type (middleware only selects id, email, name)
            const mockDecoded = { userId: 'user-123' };

            req.headers = { authorization: 'Bearer valid-token-123' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);

            // ACT
            await authenticateToken(req as AuthenticatedRequest, res, next);

            // ASSERT
            expect(mockJwt.verify).toHaveBeenCalledWith('valid-token-123', process.env.JWT_SECRET);
            expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                select: { id: true, email: true, name: true },
            });
            expect(req.user).toEqual({
                id: 'user-123',
                email: 'user@example.com',
                name: 'Test User',
            });
        });

        it('should call next() after successful authentication', async () => {
            // ARRANGE
            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                name: 'Test User',
            } as any;
            const mockDecoded = { userId: 'user-123' };

            req.headers = { authorization: 'Bearer valid-token-123' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);

            // ACT
            await authenticateToken(req as AuthenticatedRequest, res, next);

            // ASSERT
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(); // Called without arguments
        });

        it('should handle user with no name (optional field)', async () => {
            // ARRANGE
            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                name: null, // Name is optional
            } as any;
            const mockDecoded = { userId: 'user-123' };

            req.headers = { authorization: 'Bearer valid-token-123' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);

            // ACT
            await authenticateToken(req as AuthenticatedRequest, res, next);

            // ASSERT
            expect(req.user).toEqual({
                id: 'user-123',
                email: 'user@example.com',
                name: undefined, // null converted to undefined
            });
            expect(next).toHaveBeenCalled();
        });
    });

    describe('missing or malformed token', () => {
        it('should throw AppError(401) when Authorization header is missing', async () => {
            // ARRANGE
            req.headers = {}; // No authorization header

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Access token required');

            // Verify next() was NOT called
            expect(next).not.toHaveBeenCalled();
        });

        it('should throw AppError(401) when Authorization header does not start with "Bearer"', async () => {
            // ARRANGE
            req.headers = { authorization: 'InvalidFormat token-123' };

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Access token required');

            expect(next).not.toHaveBeenCalled();
        });

        it('should throw AppError(401) when token is missing after "Bearer"', async () => {
            // ARRANGE
            req.headers = { authorization: 'Bearer ' }; // No token after Bearer

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Access token required');

            expect(next).not.toHaveBeenCalled();
        });

        it('should throw AppError(401) when Authorization header is empty string', async () => {
            // ARRANGE
            req.headers = { authorization: '' };

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Access token required');

            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('invalid or expired tokens', () => {
        it('should throw AppError(401) when JWT signature is invalid (JsonWebTokenError)', async () => {
            // ARRANGE
            req.headers = { authorization: 'Bearer invalid-signature-token' };

            const jwtError = new Error('invalid signature');
            jwtError.name = 'JsonWebTokenError';
            mockJwt.verify = jest.fn().mockImplementation(() => {
                throw jwtError;
            });

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Invalid or expired token');

            expect(mockJwt.verify).toHaveBeenCalledWith('invalid-signature-token', process.env.JWT_SECRET);
            expect(next).not.toHaveBeenCalled();
        });

        it('should throw AppError(401) when JWT token is expired (TokenExpiredError)', async () => {
            // ARRANGE
            req.headers = { authorization: 'Bearer expired-token' };

            const expiredError = new Error('jwt expired');
            expiredError.name = 'TokenExpiredError';
            mockJwt.verify = jest.fn().mockImplementation(() => {
                throw expiredError;
            });

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Invalid or expired token');

            expect(next).not.toHaveBeenCalled();
        });

        it('should throw AppError(401) when JWT token format is malformed', async () => {
            // ARRANGE
            req.headers = { authorization: 'Bearer malformed.token' };

            const malformedError = new Error('jwt malformed');
            malformedError.name = 'JsonWebTokenError';
            mockJwt.verify = jest.fn().mockImplementation(() => {
                throw malformedError;
            });

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Invalid or expired token');

            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('user lookup failures', () => {
        it('should throw AppError(401) when user not found in database', async () => {
            // ARRANGE
            const mockDecoded = { userId: 'non-existent-user-id' };

            req.headers = { authorization: 'Bearer valid-token-but-no-user' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockResolvedValue(null); // User not found

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Invalid token');

            expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
                where: { id: 'non-existent-user-id' },
                select: { id: true, email: true, name: true },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should throw AppError(401) when userId from token is invalid', async () => {
            // ARRANGE
            const mockDecoded = { userId: '' }; // Empty userId

            req.headers = { authorization: 'Bearer token-with-empty-userid' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockResolvedValue(null); // No user found

            // ACT & ASSERT
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Invalid token');

            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should re-throw AppErrors without modification', async () => {
            // ARRANGE
            const mockDecoded = { userId: 'user-123' };
            const appError = new AppError(401, 'Invalid token');

            req.headers = { authorization: 'Bearer valid-token' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockResolvedValue(null); // This triggers AppError

            // ACT & ASSERT
            // The middleware should throw the AppError we created
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow(AppError);
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Invalid token');
        });

        it('should let unexpected errors bubble up (Express 5 will catch)', async () => {
            // ARRANGE
            const mockDecoded = { userId: 'user-123' };
            const unexpectedError = new Error('Database connection failed');

            req.headers = { authorization: 'Bearer valid-token' };
            mockJwt.verify = jest.fn().mockReturnValue(mockDecoded);
            mockPrismaUser.findUnique.mockRejectedValue(unexpectedError); // Database error

            // ACT & ASSERT
            // Unexpected errors should be re-thrown (Express 5 catches them)
            await expect(authenticateToken(req as AuthenticatedRequest, res, next)).rejects.toThrow('Database connection failed');

            expect(next).not.toHaveBeenCalled();
        });
    });
});
