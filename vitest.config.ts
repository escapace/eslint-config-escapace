import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/example*.ts',
        'src/test-support/**',
        ...(configDefaults.coverage.exclude ?? []),
        'src/vendor/tsdoc/*.md',
        'src/vendor/tsdoc/LICENSE',
        'src/rules/**',
        'src/types/**',
      ],
      include: ['src/**'],
      provider: 'v8',
    },
    include: [],
    passWithNoTests: true,
    projects: ['vitest.config.*.ts'],
  },
})
