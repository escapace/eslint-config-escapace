// import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import gitignore from 'eslint-config-flat-gitignore'
import eslintParserJSON from 'jsonc-eslint-parser'
import { defaultsDeep, omit } from 'lodash-es'
import eslintParserTOML from 'toml-eslint-parser'
import tseslint from 'typescript-eslint'
import eslintParserYAML from 'yaml-eslint-parser'
import { rulesDepend } from './rules/rules-depend'
import { rulesJavaScript } from './rules/rules-javascript'
import { rulesJSON } from './rules/rules-json'
import { rulesJSON5 } from './rules/rules-json5'
import { rulesJSONC } from './rules/rules-jsonc'
import { rulesTOML } from './rules/rules-toml'
import { rulesTypeScript } from './rules/rules-typescript'
import { rulesVue } from './rules/rules-vue'
import { rulesYAML } from './rules/rules-yaml'
import type { Config } from './types'
import type { RuleYamlSortKeysOptions } from './types/rule-yaml-sort-keys-options'
import { normalizeRules } from './utilities/normalize-rules'
import { interopDefault, pluginsDefault, pluginsVue } from './utilities/plugins'

type ValueOf<T> = T extends Array<infer U> ? U : never

const ruleYamlSortKeysOptionsGithubWorkflows = [
  ...[['run'], ['uses']].map(
    (hasProperties) =>
      ({
        hasProperties,
        order: [
          'name',
          'if',
          'id',
          'working-directory',
          'shell',
          'env',
          'continue-on-error',
          'timeout-minutes',
          'uses',
          'with',
          'run',
        ],
        pathPattern: '^jobs\\.[a-zA-Z_][a-zA-Z0-9_-]*\\.steps\\[[0-9]+\\]$',
      }) satisfies ValueOf<RuleYamlSortKeysOptions>,
  ),
  ...[['steps'], ['uses'], ['container'], ['services']].map(
    (hasProperties) =>
      ({
        hasProperties,
        order: [
          'name',
          'if',
          'needs',
          'runs-on',
          'permissions',
          'environment',
          'timeout-minutes',
          'defaults',
          'env',
          'secrets',
          'concurrency',
          'strategy',
          'continue-on-error',
          'outputs',
          'services',
          'container',
          'uses',
          'with',
          'steps',
        ],
        pathPattern: '^jobs\\.[a-zA-Z_][a-zA-Z0-9_-]*$',
      }) satisfies ValueOf<RuleYamlSortKeysOptions>,
  ),
  ...(rulesYAML['yaml/sort-keys']?.slice(1) ?? []),
] as unknown as RuleYamlSortKeysOptions

export type { Config, Rules } from './types'
export { normalizeRules }

export interface Options {
  javascript?: Config
  typescript?: Config
  vue?: { enabled?: boolean } & Config
}

export const compose = async (
  ...configs: Array<
    Config | Config[] | Promise<Config[] | undefined> | Promise<Config | undefined> | undefined
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
    files: options.typescript?.files ?? ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
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
        project: undefined, // options.typescript?.languageOptions?.parserOptions?.project,
        // tsconfigRootDir: options.typescript?.languageOptions?.parserOptions?.tsconfigRootDir ?? import.meta.dirname,
        projectService: options.typescript?.languageOptions?.parserOptions?.projectService ?? {
          allowDefaultProject: ['*.js', '*.mjs', '*.cjs'],
          defaultProject: 'tsconfig.json',
        },
        // options.typescript?.languageOptions?.parserOptions?.project === undefined
        //   ? true
        //   : options.typescript?.languageOptions?.parserOptions?.project,
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
    files: options.javascript?.files ?? ['**/*.?([cm])js', '**/*.?([cm])jsx'],
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
        files: options.vue?.files ?? ['**/*.vue'],
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

        '**/bun.lockb',
        '**/dist',
        '**/node_modules',
        '**/package-lock.json',
        '**/pnpm-lock.yaml',
        '**/yarn.lock',

        '**/.cache',
        '**/.changeset',
        '**/.history',
        '**/.idea',
        '**/.next',
        '**/.nuxt',
        '**/.output',
        '**/.vercel',
        '**/.vite-inspect',
        '**/.vitepress/cache',
        '**/.wrangler',
        '**/.yarn',
        '**/coverage',

        '**/*.min.*',
        '**/CHANGELOG*.md',
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
      files: ['**/.github/workflows/**.{yml,yaml}'],
      languageOptions: {
        parser: eslintParserYAML,
      },
      rules: {
        'yaml/sort-keys': ['error', ...ruleYamlSortKeysOptionsGithubWorkflows],
      },
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
        ...rulesDepend,
        'json/sort-keys': 'off',
      },
    },
  )
}
