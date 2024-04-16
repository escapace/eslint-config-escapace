import type { TSESLint } from '@typescript-eslint/utils'
import type { RuleEntry } from '../types'

const levelToString = (
  value: TSESLint.SharedConfig.Severity | TSESLint.SharedConfig.SeverityString
): TSESLint.SharedConfig.SeverityString => {
  if (value === 0) {
    return 'off'
  } else if (value === 1) {
    return 'warn'
  } else if (value === 2) {
    return 'error'
  } else {
    return value
  }
}

export const normalizeRules = (
  ...rules: Array<Partial<Record<string, TSESLint.SharedConfig.RuleEntry>>>
): Record<string, RuleEntry | undefined> =>
  Object.fromEntries(
    Object.entries(
      Object.assign({}, ...rules) as Partial<
        Record<string, TSESLint.SharedConfig.RuleEntry>
      >
    )
      .map(([key, value]): [string, RuleEntry | undefined] => {
        if (value === undefined) {
          return [key, undefined]
        } else if (Array.isArray(value)) {
          const [level, ...options] = value

          return [key, [levelToString(level), ...options]]
        } else {
          return [key, levelToString(value)]
        }
      })
      .filter(([_, value]) => value !== undefined)
  )
