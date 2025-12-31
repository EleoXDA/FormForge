import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Use happy-dom for faster DOM simulation
    environment: 'happy-dom',
    // Global test utilities
    globals: true,
    // Setup file for common test configuration
    setupFiles: ['./src/test/setup.ts'],
    // Include patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})