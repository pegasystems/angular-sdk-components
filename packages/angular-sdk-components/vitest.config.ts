import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Every spec file gets a fresh module graph and global state. The global hooks in src/test-hooks.ts are registered by
    // a setup file, which is only re-executed per file when modules are not shared between files.
    isolate: true
  }
});
