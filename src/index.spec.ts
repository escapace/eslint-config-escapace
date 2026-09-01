import { ESLint, Linter } from 'eslint'
import { isEmpty, isEqual, pickBy } from 'es-toolkit/compat'
import { exec as _exec } from 'node:child_process'
import path from 'node:path'
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

const ruleDefinitionsById = new Map(await ruleDefinitions())

const lintMessages = (
  code: string,
  config: Linter.Config[],
  filename = 'src/index.ts',
): Linter.LintMessage[] =>
  new Linter({ cwd: process.cwd() }).verify(code, config, {
    filename: path.resolve(filename),
  })

const checks = (
  rules: Record<string, RuleEntry | undefined>,
  defaults: Record<string, RuleEntry | undefined>,
) => {
  // check if rule exists
  const absent = pickBy(rules, (_, key) => !ruleDefinitionsById.has(key))

  if (!isEmpty(absent)) {
    throw new Error(`The following rules do not exist: ${JSON.stringify(absent, null, 2)}`)
  }

  const deprecated = pickBy(
    rules,
    (_, key) => ruleDefinitionsById.get(key)?.meta.deprecated === true,
  )

  if (!isEmpty(deprecated)) {
    throw new Error(`The following rules are deprecated: ${JSON.stringify(deprecated, null, 2)}`)
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

it('preserves behavior while replacing deprecated rules', { timeout: 60_000 }, async () => {
  const config = (await compose(escapace())) as Linter.Config[]
  const lintRuleIds = (code: string): string[] =>
    lintMessages(code, config).map((message) => message.ruleId ?? `<${message.message}>`)

  expect(
    lintRuleIds('interface Parent { value: string }\ninterface Child extends Parent {}\n'),
  ).not.toContain('typescript/no-empty-object-type')
  expect(lintRuleIds('interface Empty {}\n')).toContain('typescript/no-empty-object-type')

  const loopRuleIds = lintRuleIds(
    'for (var index = 0; index < 2; index += 1) { setTimeout(() => index) }\n',
  )
  expect(loopRuleIds).toContain('no-loop-func')
  expect(loopRuleIds).not.toContain('typescript/no-loop-func')

  const precisionRuleIds = lintRuleIds('const value = 9007199254740993\nvoid value\n')
  expect(precisionRuleIds).toContain('no-loss-of-precision')
  expect(precisionRuleIds).not.toContain('typescript/no-loss-of-precision')

  const directiveRuleIds = lintRuleIds('// @ts-ignore\nconst value: string = 1\nvoid value\n')
  expect(directiveRuleIds).toContain('typescript/ban-ts-comment')
  expect(directiveRuleIds).not.toContain('typescript/prefer-ts-expect-error')

  const unionRuleIds = lintRuleIds('type Value = string | boolean\nvoid (0 as unknown as Value)\n')
  expect(unionRuleIds).toContain('perfectionist/sort-union-types')
  expect(unionRuleIds).not.toContain('typescript/sort-type-constituents')
})

it('extends the preset name replacements by default', { timeout: 60_000 }, async () => {
  const config = (await compose(escapace(), {
    rules: {
      'unicorn/name-replacements': [
        'warn',
        {
          replacements: {
            usr: { user: true },
          },
        },
      ],
    },
  })) as Linter.Config[]
  const messages = lintMessages(
    'const app = 1\nconst usr = 2\nconst err = new Error()\nvoid [app, usr, err]\n',
    config,
  ).filter(({ ruleId }) => ruleId === 'unicorn/name-replacements')

  expect(messages).toHaveLength(3)
  expect(messages.every(({ severity }) => severity === 1)).toBe(true)
  expect(messages.map(({ message }) => message)).toEqual(
    expect.arrayContaining([
      expect.stringContaining('`app` should be named `application`'),
      expect.stringContaining('`usr` should be named `user`'),
      expect.stringContaining('`err` should be named `error`'),
    ]),
  )
})

it('ignores conventional config filenames', async () => {
  const config = (await escapace()) as Linter.Config[]
  const messages = lintMessages('export default {}\n', config, 'eslint.config.mjs')

  expect(messages.map(({ ruleId }) => ruleId)).not.toContain('unicorn/name-replacements')
})

it('allows replacement of all name replacements when explicitly requested', async () => {
  const config = (await compose(escapace(), {
    rules: {
      'unicorn/name-replacements': [
        'error',
        {
          extendDefaultReplacements: false,
          replacements: {
            usr: { user: true },
          },
        },
      ],
    },
  })) as Linter.Config[]
  const messages = lintMessages(
    'const app = 1\nconst usr = 2\nconst err = new Error()\nvoid [app, usr, err]\n',
    config,
  ).filter(({ ruleId }) => ruleId === 'unicorn/name-replacements')

  expect(messages).toHaveLength(1)
  expect(messages[0]?.message).toContain('`usr` should be named `user`')
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
