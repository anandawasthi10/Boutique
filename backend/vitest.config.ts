import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 20000,
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
