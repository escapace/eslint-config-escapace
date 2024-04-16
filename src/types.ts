import type { TSESLint } from '@typescript-eslint/utils'

export type RuleEntry =
  | [TSESLint.SharedConfig.SeverityString, ...unknown[]]
  | TSESLint.SharedConfig.SeverityString
