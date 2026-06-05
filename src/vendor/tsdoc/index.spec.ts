/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See ./LICENSE for license information.
 */

import { RuleTester } from 'eslint'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, describe, it, vi } from 'vitest'

import plugin from './index'
import { createSyntaxRule, type TsDocumentConfigLoader } from './rule'

const previousRuleTesterDescribe = RuleTester.describe
const previousRuleTesterIt = RuleTester.it
const ruleTesterIt = ((name: unknown, run?: () => void) => {
  // eslint-disable-next-line vitest/valid-title
  it(String(name), run, 60_000)
}) as unknown as typeof it

RuleTester.describe = describe
RuleTester.it = ruleTesterIt

const invalidConfigurationDirectory = mkdtempSync(
  path.join(tmpdir(), 'eslint-config-escapace-tsdoc-invalid-'),
)
const customConfigurationDirectory = mkdtempSync(
  path.join(tmpdir(), 'eslint-config-escapace-tsdoc-custom-'),
)

writeFileSync(path.join(invalidConfigurationDirectory, 'tsdoc.json'), '{')
writeFileSync(
  path.join(customConfigurationDirectory, 'tsdoc.json'),
  JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json',
    supportForTags: {
      '@myTag': true,
    },
    tagDefinitions: [
      {
        syntaxKind: 'modifier',
        tagName: '@myTag',
      },
    ],
  }),
)

// eslint-disable-next-line vitest/prefer-hooks-on-top
afterAll(() => {
  RuleTester.describe = previousRuleTesterDescribe
  RuleTester.it = previousRuleTesterIt
  rmSync(invalidConfigurationDirectory, { force: true, recursive: true })
  rmSync(customConfigurationDirectory, { force: true, recursive: true })
})

const createRuleConfigFile = (
  overrides: Partial<ReturnType<TsDocumentConfigLoader>> = {},
): ReturnType<TsDocumentConfigLoader> => ({
  configureParser: vi.fn(),
  fileNotFound: false,
  hasErrors: false,
  getErrorSummary: () => '',
  ...overrides,
})

const ruleTester: RuleTester = new RuleTester()
ruleTester.run('"tsdoc/syntax" rule', plugin.rules.syntax, {
  invalid: [
    {
      code: '/**\n * This `is wrong\n */\nfunction foobar() {}\n',
      errors: [
        {
          messageId: 'tsdoc-code-span-missing-delimiter',
        },
      ],
    },
    {
      code: '/**\n * This `is wrong\n */\nclass FooBar {}\n',
      errors: [
        {
          messageId: 'tsdoc-code-span-missing-delimiter',
        },
      ],
    },
    {
      code: '/** A great function! */\nfunction foobar() {}\n',
      errors: [
        {
          messageId: 'error-loading-config-file',
        },
      ],
      filename: path.join(invalidConfigurationDirectory, 'example.ts'),
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: invalidConfigurationDirectory,
        },
      },
    },
    {
      code: '/**\n * A custom-tagged function.\n * @myTag\n */\nfunction foobar() {}\n',
      errors: [
        {
          messageId: 'tsdoc-undefined-tag',
        },
      ],
    },
  ],
  valid: [
    '/**\nA great function!\n */\nfunction foobar() {}\n',
    '/**\nA great class!\n */\nclass FooBar {}\n',
    '/** @jsx h */',
    '/* This is not a TSDoc comment. */\nfunction foobar() {}\n',
    '// This is a line comment.\nfunction foobar() {}\n',
    '/**/\nfunction foobar() {}\n',
    '/** A great function! */\nfunction foobar() {}\n',
    {
      code: '/**\n * A custom-tagged function.\n * @myTag\n */\nfunction foobar() {}\n',
      filename: path.join(customConfigurationDirectory, 'example.ts'),
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: customConfigurationDirectory,
        },
      },
    },
  ],
})

ruleTester.run(
  '"tsdoc/syntax" rule with injected config loader',
  createSyntaxRule({
    loadConfigForSourceFile: () => {
      throw new Error('config load failure')
    },
  }),
  {
    invalid: [
      {
        code: '/** A great function! */\nfunction foobar() {}\n',
        errors: [
          {
            message: 'Error loading TSDoc config file:\nUnexpected exception: config load failure',
          },
        ],
      },
    ],
    valid: [],
  },
)

ruleTester.run(
  '"tsdoc/syntax" rule with parser configuration failure',
  createSyntaxRule({
    loadConfigForSourceFile: () =>
      createRuleConfigFile({
        configureParser: () => {
          throw new Error('bad parser configuration')
        },
      }),
  }),
  {
    invalid: [
      {
        code: '/** A great function! */\nfunction foobar() {}\n',
        errors: [
          {
            message: 'Error applying TSDoc configuration: bad parser configuration',
          },
        ],
      },
    ],
    valid: [],
  },
)
