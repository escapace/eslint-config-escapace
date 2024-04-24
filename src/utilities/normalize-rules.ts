import type { TSESLint } from '@typescript-eslint/utils'
import type { RuleEntry } from '../types'

const levelToString = (
  key: string,
  value: TSESLint.SharedConfig.Severity | TSESLint.SharedConfig.SeverityString,
): TSESLint.SharedConfig.SeverityString => {
  switch (value) {
    case 0:
    case 'off':
      return 'off'
    case 1:
    case 'warn':
      return 'warn'
    case 2:
    case 'error':
      return key.startsWith('perfectionist/') ? 'warn' : 'error'
  }
}

const pairs: Array<[string, string | undefined]> = [
  ['@babel', undefined],
  ['react', undefined],
  ['@typescript-eslint', 'typescript'],
  ['vuejs-accessibility', 'vue-a11y'],
  ['yml', 'yaml'],
  ['jsonc', 'json'],
  ['@stylistic', 'stylistic'],
]

const normalizeRuleKey = (key: string) => {
  const pair = pairs.find(([namespace]) => key.startsWith(`${namespace}/`))

  if (pair === undefined) {
    return key
  } else {
    const [namespace, newNamespace] = pair

    if (newNamespace === undefined) {
      return undefined
    }

    return `${newNamespace}${key.substring(namespace.length)}`
  }
}

export const normalizeRules = (
  ...rules: Array<Partial<Record<string, TSESLint.SharedConfig.RuleEntry>> | undefined>
): Record<string, RuleEntry> => {
  if (rules.length === 0) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(
      Object.assign(
        {},
        ...rules.filter(
          (value): value is Partial<Record<string, TSESLint.SharedConfig.RuleEntry>> =>
            value !== undefined,
        ),
      ) as Partial<Record<string, TSESLint.SharedConfig.RuleEntry>>,
    )
      .map(([_key, value]): [string, RuleEntry] | undefined => {
        const key = normalizeRuleKey(_key)

        if (value === undefined || key === undefined) {
          return undefined
        }

        if (Array.isArray(value)) {
          const [level, ...options] = value

          return [key, [levelToString(key, level), ...options]]
        } else {
          return [key, levelToString(key, value)]
        }
      })
      .filter((value): value is [string, RuleEntry] => value !== undefined),
  )
}
