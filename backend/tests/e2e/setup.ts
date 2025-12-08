import { PrismaClient } from '@prisma/client';

// Separate Prisma instance for E2E tests
export const prisma = new PrismaClient();

/**
 * Clean database before each test
 * Order matters: delete todos first (FK constraint), then users
 */
export const cleanDatabase = async (): Promise<void> => {
  await prisma.todo.deleteMany({});
  await prisma.user.deleteMany({});
};

/**
 * Disconnect Prisma after all tests
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

/**
 * Helper: Create test user
 */
export const createTestUser = async (userData: {
  email: string;
  password: string;
  name?: string;
}) => {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  return prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
    },
  });
};

/**
 * Helper: Generate JWT token for user
 */
export const generateTestToken = (userId: string): string => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
};
