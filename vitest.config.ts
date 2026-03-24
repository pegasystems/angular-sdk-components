import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: resolve(__dirname, 'packages/angular-sdk-components/tsconfig.spec.json'),
      jit: true
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
    include: ['packages/angular-sdk-components/src/**/*.spec.ts'],
    reporters: ['default'],
    sequence: {
      shuffle: false
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['packages/angular-sdk-components/src/lib/_components/field/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.html', '**/*.scss']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './packages/angular-sdk-components/src'),
      '@pega/auth/lib/sdk-auth-manager': resolve(__dirname, './__mocks__/sdk-auth-manager.ts')
    }
  }
});
