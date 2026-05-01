import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/example*.ts',
        'src/test-support/**',
        'src/vendor/tsdoc/*.md',
        'src/vendor/tsdoc/LICENSE',
        ...(configDefaults.coverage.exclude ?? []),
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
