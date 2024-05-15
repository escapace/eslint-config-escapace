// import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import gitignore from 'eslint-config-flat-gitignore'
import eslintParserJSON from 'jsonc-eslint-parser'
import { defaultsDeep, omit } from 'lodash-es'
import tseslint from 'typescript-eslint'
import eslintParserYAML from 'yaml-eslint-parser'
import { interopDefault, pluginsDefault, pluginsVue } from './plugins'
import rulesJavascript from './rules/javascript.json'
import rulesJSON from './rules/json.json'
import rulesJSON5 from './rules/json5.json'
import rulesJSONC from './rules/jsonc.json'
import rulesTypescript from './rules/typescript.json'
import rulesVue from './rules/vue.json'
import rulesYAML from './rules/yaml.json'
import type { Config } from './types'
import { normalizeRules } from './utilities/normalize-rules'

export type { RulesIntersection } from './rules-intersection'
export type { Config, Prettify, RuleEntry, RuleEntryAlphanumeric, Rules } from './types'
export { normalizeRules }

const globs = {
  javascript: ['**/*.?([cm])js', '**/*.?([cm])jsx'],
  json: ['**/*.json', '**/*.json5', '**/*.jsonc'],
  typescript: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
  vue: ['**/*.vue'],
  yaml: ['**/*.y?(a)ml'],
}

/**
 * @public
 */
export interface Options {
  javascript?: Config
  typescript?: Config
  vue?: { enabled?: boolean } & Config
}

/**
 * @public
 */
export const compose = (...configs: Array<Config | undefined>): Config[] =>
  configs.filter((value): value is Config => value !== undefined).flatMap((config) => [config])

/**
 * blabalo
 *
 * @public
 */
export const escapace = async (options: Options = {}): Promise<Config[]> => {
  const flags = {
    vue: options?.vue?.enabled === true,
  }

  const plugins = { ...pluginsDefault, ...(flags.vue ? await pluginsVue() : undefined) }
  const parser = flags.vue ? await interopDefault(import('vue-eslint-parser')) : tseslint.parser

  const typescript: Config = {
    ...options.typescript,
    files: options.typescript?.files ?? globs.typescript,
    languageOptions: {
      parser,
      parserOptions: {
        ...options.typescript?.languageOptions?.parserOptions,
        ecmaFeatures: {
          jsx: true,
          ...options.typescript?.languageOptions?.parserOptions?.ecmaFeatures,
        },
        extraFileExtensions: [
          ...(flags.vue ? ['.vue'] : []),
          ...(options.typescript?.languageOptions?.parserOptions?.extraFileExtensions ?? []),
        ],
        parser: flags.vue ? tseslint.parser : undefined,
        project:
          options.typescript?.languageOptions?.parserOptions?.project === undefined
            ? true
            : options.typescript?.languageOptions?.parserOptions?.project,
      },
    },
    rules: {
      ...rulesTypescript,
      ...(flags.vue ? rulesVue : {}),
      ...normalizeRules(options.typescript?.rules),
    },
  }

  const javascript: Config = {
    ...options.javascript,
    files: options.javascript?.files ?? globs.javascript,
    languageOptions: defaultsDeep(
      {},
      {
        ...typescript.languageOptions,
        parserOptions: {
          ...typescript.languageOptions?.parserOptions,
          project: undefined,
        },
      } satisfies Config['languageOptions'],
      options.javascript,
    ) as Config['languageOptions'],
    rules: {
      ...rulesJavascript,
      ...(flags.vue ? rulesVue : {}),
      ...normalizeRules(options.javascript?.rules),
    },
  }

  const vue: Config | undefined = flags.vue
    ? {
        ...omit(options.vue, 'enabled'),
        files: options.vue?.files ?? globs.vue,
        languageOptions: defaultsDeep(
          {},
          typescript.languageOptions,
          options.vue?.languageOptions,
        ) as Config['languageOptions'],
        // eslint-disable-next-line typescript/no-non-null-assertion
        processor: plugins.vue!.processors!['.vue'],
        rules: { ...typescript.rules, ...normalizeRules(options.vue?.rules) },
      }
    : undefined

  return compose(
    {
      ignores: [
        '**/fish_history',

        '**/node_modules',
        '**/dist',
        '**/package-lock.json',
        '**/yarn.lock',
        '**/pnpm-lock.yaml',
        '**/bun.lockb',

        '**/coverage',
        '**/.history',
        '**/.vitepress/cache',
        '**/.nuxt',
        '**/.next',
        '**/.vercel',
        '**/.changeset',
        '**/.idea',
        '**/.cache',
        '**/.output',
        '**/.vite-inspect',
        '**/.yarn',

        '**/CHANGELOG*.md',
        '**/*.min.*',
        '**/LICENSE*',
        '**/__snapshots__',
        '**/auto-import?(s).d.ts',
      ],
    },
    gitignore({
      files: ['.gitignore', '.eslintignore'],
      strict: false,
    }),
    { plugins },
    typescript,
    javascript,
    vue,
    {
      files: ['**/*.y?(a)ml'],
      languageOptions: {
        parser: eslintParserYAML,
      },
      rules: rulesYAML,
    },
    {
      files: ['**/*.json'],
      languageOptions: {
        parser: eslintParserJSON,
      },
      rules: rulesJSON,
    },
    {
      files: ['**/*.json5'],
      languageOptions: {
        parser: eslintParserJSON,
      },
      rules: rulesJSON5,
    },
    {
      files: [
        '**/*.jsonc',
        '**/tsconfig.{json,jsonc}',
        '**/tsconfig{-,.}[:alnum:].{json,jsonc}',
        '**/api-extractor.{json,jsonc}',
      ],
      languageOptions: {
        parser: eslintParserJSON,
      },
      rules: rulesJSONC,
    },
    {
      files: ['**/package.json'],
      rules: {
        'json/sort-keys': 'off',
      },
    },
  )
}
