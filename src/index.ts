// import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import gitignore from 'eslint-config-flat-gitignore'
import eslintParserJSON from 'jsonc-eslint-parser'
import { defaultsDeep, omit } from 'lodash-es'
import eslintParserTOML from 'toml-eslint-parser'
import tseslint from 'typescript-eslint'
import eslintParserYAML from 'yaml-eslint-parser'
import { rulesJavaScript } from './rules/rules-javascript'
import { rulesJSON } from './rules/rules-json'
import { rulesJSON5 } from './rules/rules-json5'
import { rulesJSONC } from './rules/rules-jsonc'
import { rulesTOML } from './rules/rules-toml'
import { rulesTypeScript } from './rules/rules-typescript'
import { rulesVue } from './rules/rules-vue'
import { rulesYAML } from './rules/rules-yaml'
import type { Config } from './types'
import { normalizeRules } from './utilities/normalize-rules'
import { interopDefault, pluginsDefault, pluginsVue } from './utilities/plugins'

export type { Config, Rules } from './types'
export { normalizeRules }

const globs = {
  javascript: ['**/*.?([cm])js', '**/*.?([cm])jsx'],
  json: ['**/*.json', '**/*.json5', '**/*.jsonc'],
  typescript: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
  vue: ['**/*.vue'],
  yaml: ['**/*.y?(a)ml'],
}

export interface Options {
  javascript?: Config
  typescript?: Config
  vue?: { enabled?: boolean } & Config
}

export const compose = async (
  ...configs: Array<
    Config | Config[] | Promise<Config | undefined> | Promise<Config[] | undefined> | undefined
  >
): Promise<Config[]> => {
  const composition: Config[] = []

  for (const _value of configs) {
    const value = await _value

    if (value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      composition.push(...value)
    } else {
      composition.push(value)
    }
  }

  return composition
}

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
      ...rulesTypeScript,
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
      ...rulesJavaScript,
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

  return await compose(
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
      settings: {
        perfectionist: {
          ignoreCase: true,
          partitionByComment: true,
          partitionByNewLine: true,
          type: 'alphabetical',
        },
      },
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
      files: ['**/*.toml'],
      languageOptions: {
        parser: eslintParserTOML,
      },
      rules: rulesTOML,
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
