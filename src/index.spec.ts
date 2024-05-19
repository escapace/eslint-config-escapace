import { isEmpty, isEqual, pickBy } from 'lodash-es'
import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import { it } from 'vitest'
import {
  rulesJSON5Defaults,
  rulesJSONCDefaults,
  rulesJSONDefaults,
  rulesJSONIncluded,
  rulesTypescriptDefaults,
  rulesTypescriptIncluded,
  rulesVueDefaults,
  rulesVueIncluded,
  rulesYAMLDefaults,
  rulesYAMLIncluded,
} from './config'
import type { RuleEntry } from './types'
import { ruleDefinitions } from './utilities/rule-definitions'
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
  checks(rulesJSONIncluded, rulesJSONDefaults)
  checks(rulesJSONIncluded, rulesJSON5Defaults)
  checks(rulesJSONIncluded, rulesJSONCDefaults)
  checks(rulesVueIncluded, rulesVueDefaults)
})

it('eslint', { timeout: 10_000 }, async () => {
  await exec('eslint')
})
