import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  plugins: [],
  resolve: {
    alias: {
      '@public': path.resolve(__dirname, './public'),
      components: path.resolve(__dirname, './src/components'),
      hooks: path.resolve(__dirname, './src/hooks'),
      lib: path.resolve(__dirname, './src/lib'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
