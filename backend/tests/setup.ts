import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.DATABASE_URL = 'file:./test.db';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

beforeAll(async () => {
  // Set up test database
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' }
  });
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.todo.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };