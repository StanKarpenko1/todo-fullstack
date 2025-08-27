import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

beforeAll(async () => {
  // Create test database
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
  // Cleanup
  await prisma.$disconnect();
});

export { prisma };