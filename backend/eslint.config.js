import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginJest from 'eslint-plugin-jest'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      semi: 'off',
      'prefer-const': 'error',
      'no-unused-vars': 'off', // Use TypeScript's check instead
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'no-undef': 'off', // TypeScript handles this
      'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Test files specific config (no strict tsconfig project required)
    files: ['tests/**/*.ts'],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...pluginJest.environments.globals.globals,
      },
    },
    rules: {
      ...pluginJest.configs.recommended.rules,
      semi: 'off',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'off', // Allow require() in test mocks
      'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],
      '@typescript-eslint/no-explicit-any': 'off',
      'jest/expect-expect': 'warn',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
    },
  }
)
