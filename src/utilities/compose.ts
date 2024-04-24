import type { TSESLint } from '@typescript-eslint/utils'

export const compose = (
  ...configs: Array<TSESLint.FlatConfig.Config | undefined>
): TSESLint.FlatConfig.ConfigArray =>
  configs
    .filter((value): value is TSESLint.FlatConfig.Config => value !== undefined)
    .flatMap((config) => [config])
