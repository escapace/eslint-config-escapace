import { ESLint } from 'eslint'
import { isEmpty, isEqual, pickBy } from 'es-toolkit/compat'
import { exec as _exec } from 'node:child_process'
import { it, expect } from 'vitest'

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
import { compose, escapace } from './index'
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

it('rules', { timeout: 60_000 }, () => {
  checks(rulesTypescriptIncluded, rulesTypescriptDefaults)
  checks(rulesYAMLIncluded, rulesYAMLDefaults)
  checks(rulesTOMLIncluded, rulesTOMLDefaults)
  checks(rulesJSONIncluded, rulesJSONDefaults)
  checks(rulesJSONIncluded, rulesJSON5Defaults)
  checks(rulesJSONIncluded, rulesJSONCDefaults)
  checks(rulesVueIncluded, rulesVueDefaults)
})

it('ignores generated artifacts and imported ignore files', { timeout: 60_000 }, async () => {
  const eslint = new ESLint({
    overrideConfig: (await compose(escapace())) as never,
    overrideConfigFile: true,
  })

  await expect(eslint.isPathIgnored('out/generated.ts')).resolves.toBe(true)
  await expect(eslint.isPathIgnored('components/__snapshots__/button.ts')).resolves.toBe(true)
  await expect(eslint.isPathIgnored('src/auto-imports.d.ts')).resolves.toBe(true)
  await expect(eslint.isPathIgnored('src/index.ts')).resolves.toBe(false)
})

it('eslint', { timeout: 60_000 }, async () => {
  await exec(`./node_modules/.bin/eslint 'src/**/*.ts'`)
})
