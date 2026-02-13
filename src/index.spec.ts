import { isEmpty, isEqual, pickBy } from 'es-toolkit/compat'
import { exec as _exec } from 'node:child_process'
import { it } from 'vitest'
import {
  rulesJSON5Defaults,
  rulesJSONCDefaults,
  rulesJSONDefaults,
  rulesJSONIncluded,
  rulesTOMLDefaults,
  rulesTOMLIncluded,
  rulesTypescriptDefaults,
  rulesTypescriptIncluded,
  rulesVueDefaults,
  rulesVueIncluded,
  rulesYAMLDefaults,
  rulesYAMLIncluded,
} from './config'
import type { RuleEntry } from './types'
import { ruleDefinitions } from './utilities/rule-definitions'
import { promisify } from 'node:util'
const exec = promisify(_exec)

const rulesAll = (await ruleDefinitions()).map(([key]) => key)

const checks = (
  rules: Record<string, RuleEntry | undefined>,
  defaults: Record<string, RuleEntry | undefined>,
) => {
  // check if rule exists
  const absent = pickBy(rules, (_, key) => !rulesAll.includes(key))

  if (!isEmpty(absent)) {
    throw new Error(`The following rules do not exist: ${JSON.stringify(absent, null, 2)}`)
  }

  // check if rule is default
  const duplicates = pickBy(rules, (value, key) => isEqual(defaults[key], value))

  if (!isEmpty(duplicates)) {
    throw new Error(
      `The following rules are already set to their defaults: ${JSON.stringify(duplicates, null, 2)}`,
    )
  }
}

it('rules', () => {
  checks(rulesTypescriptIncluded, rulesTypescriptDefaults)
  checks(rulesYAMLIncluded, rulesYAMLDefaults)
  checks(rulesTOMLIncluded, rulesTOMLDefaults)
  checks(rulesJSONIncluded, rulesJSONDefaults)
  checks(rulesJSONIncluded, rulesJSON5Defaults)
  checks(rulesJSONIncluded, rulesJSONCDefaults)
  checks(rulesVueIncluded, rulesVueDefaults)
})

it('eslint', { timeout: 30_000 }, async () => {
  await exec(`./node_modules/.bin/eslint 'src/**/*.ts'`)
})
