import { register } from '../../../src/controllers/auth.controller'
import { Request, Response } from 'express'
import { createMockRequest, createMockResponse, createMockUser } from '../setup';
import bcrypt from 'bcryptjs';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mockPrismaUser = {
        findUnique: jest.fn(),
        create: jest.fn()
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

        req = createMockRequest();
        res = createMockResponse();
    })

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
                    email: requestBody.email ,
                    name: requestBody.name,
                });

                // Mock: Password hashing
                (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password-123');

                // Mock: User creation
                mockPrismaUser.create.mockResolvedValue(mockUser);



                // ACT
                await register(req, res);

                // ASSERT
                // Verify: Check for duplicate email in DB
                expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
                    where: { email: requestBody.email }
                });

                // Verify: Password was hashed with bcrypt
                expect(bcrypt.hash).toHaveBeenCalledWith(requestBody.password, 12);

                // Verify: User created with hashed password
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

                // Verify: JWT token generated with user ID

                // Verify: Response status is 201 Created

                // Verify: Response contains user data and token

            })
        })
    })
})