module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.e2e.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tests/tsconfig.json'
    }]
  },
  // E2E tests run serially (not in parallel) to avoid DB conflicts
  maxWorkers: 1,
  // Longer timeout for E2E tests (DB operations take time)
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  // Set NODE_ENV to test (silences expected errors in logs)
  setupFiles: ['<rootDir>/tests/e2e/jest.setup.js']
};
