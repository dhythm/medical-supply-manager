import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['server/**/*.integration.test.ts'],
    fileParallelism: false,
  },
})
