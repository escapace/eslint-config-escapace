import type { RuleEntry, RuleEntryAlphanumeric } from '../types'

const levelToString = (
  key: string,
  value: 'error' | 'off' | 'warn' | 0 | 1 | 2,
): 'error' | 'off' | 'warn' => {
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

const ruleKeyAliases: Array<[prefix: string, replacement: string | undefined]> = [
  ['@babel', undefined],
  ['react', undefined],
  ['@typescript-eslint', 'typescript'],
  ['vuejs-accessibility', 'vue-a11y'],
  ['yml', 'yaml'],
  ['jsonc', 'json'],
  ['@stylistic', 'stylistic'],
]

const normalizeRuleKey = (key: string): string | undefined => {
  const alias = ruleKeyAliases.find(([prefix]) => key.startsWith(`${prefix}/`))

  if (alias === undefined) {
    return key
  }

  const [prefix, replacement] = alias

  return replacement === undefined ? undefined : `${replacement}${key.substring(prefix.length)}`
}

export const normalizeRules = (
  ...rules: Array<Partial<Record<string, RuleEntry | RuleEntryAlphanumeric>> | undefined>
): Record<string, RuleEntry> => {
  if (rules.length === 0) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(
      Object.assign(
        {},
        ...rules.filter(
          (value): value is Partial<Record<string, RuleEntryAlphanumeric>> => value !== undefined,
        ),
      ) as Partial<Record<string, RuleEntryAlphanumeric>>,
    ).flatMap(([rawKey, value]): Array<[string, RuleEntry]> => {
      const key = normalizeRuleKey(rawKey)

      if (value === undefined || key === undefined) {
        return []
      }

      if (Array.isArray(value)) {
        const [level, ...options] = value

        return [[key, [levelToString(key, level), ...options]]]
      }

      return [[key, levelToString(key, value)]]
    }),
  )
}
