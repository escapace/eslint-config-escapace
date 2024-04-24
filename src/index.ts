import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import gitignore from 'eslint-config-flat-gitignore'
import eslintParserJSON from 'jsonc-eslint-parser'
import { defaultsDeep, omit } from 'lodash-es'
import tseslint from 'typescript-eslint'
import eslintParserYAML from 'yaml-eslint-parser'
import { interopDefault, pluginsDefault, pluginsVue } from './plugins'
import rulesJavascript from './rules/javascript.json'
import rulesJSON from './rules/json.json'
import rulesTypescript from './rules/typescript.json'
import rulesVue from './rules/vue.json'
import rulesYAML from './rules/yaml.json'
import { compose } from './utilities/compose'
import { normalizeRules } from './utilities/normalize-rules'

export { compose, normalizeRules }

export const globs = {
  javascript: ['**/*.?([cm])js', '**/*.?([cm])jsx'],
  json: ['**/*.json', '**/*.json5', '**/*.jsonc'],
  typescript: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
  vue: ['**/*.vue'],
  yaml: ['**/*.y?(a)ml'],
}

export interface Options {
  javascript?: FlatConfig.Config
  typescript?: FlatConfig.Config
  vue?: { enabled?: boolean } & FlatConfig.Config
}

export const escapace = async (options: Options = {}) => {
  const flags = {
    vue: options?.vue?.enabled === true,
  }

  const plugins = { ...pluginsDefault, ...(flags.vue ? await pluginsVue() : undefined) }
  const parser = flags.vue ? await interopDefault(import('vue-eslint-parser')) : tseslint.parser

  const typescript: FlatConfig.Config = {
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

  const javascript: FlatConfig.Config = {
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
      } satisfies FlatConfig.LanguageOptions,
      options.javascript,
    ) as FlatConfig.LanguageOptions,
    rules: {
      ...rulesJavascript,
      ...(flags.vue ? rulesVue : {}),
      ...normalizeRules(options.javascript?.rules),
    },
  }

  const vue: FlatConfig.Config | undefined = flags.vue
    ? {
        ...omit(options.vue, 'enabled'),
        files: options.vue?.files ?? globs.vue,
        languageOptions: defaultsDeep(
          {},
          typescript.languageOptions,
          options.vue?.languageOptions,
        ) as FlatConfig.LanguageOptions,
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
      files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
      languageOptions: {
        parser: eslintParserJSON,
      },
      rules: rulesJSON,
    },
    {
      files: ['**/package.json'],
      rules: {
        'json/sort-keys': 'off',
      },
    },
  )
}
