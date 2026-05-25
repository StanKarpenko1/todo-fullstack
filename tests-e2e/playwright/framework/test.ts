import { mergeTests } from '@playwright/test';
import { test as authTest } from '../features/auth/fixtures';

export const test = mergeTests(authTest);
export { expect } from '@playwright/test';
