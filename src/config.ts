import eslint from '@eslint/js'
import type { TSESLint } from '@typescript-eslint/utils'
import type { LooseRuleCreateFunction } from '@typescript-eslint/utils/ts-eslint'
import type { Rule } from 'eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import type { RuleEntry } from './types'
import { normalizeRules } from './utilities/normalize-rules'
// @ts-expect-error no-types
import eslintConfigPerfectionist from 'eslint-plugin-perfectionist/configs/recommended-alphabetical'
import eslintPluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import { mapValues, pickBy } from 'lodash-es'
import assert from 'node:assert'
import tseslint from 'typescript-eslint'
import { pluginsAll } from './plugins'

const plugins = await pluginsAll()

const compose = (
  ...configs: Array<TSESLint.FlatConfig.Config | undefined>
): TSESLint.FlatConfig.ConfigArray =>
  configs
    .filter((value): value is TSESLint.FlatConfig.Config => value !== undefined)
    .flatMap((config) => [config])

const ok = <T>(value: T): Exclude<T, undefined> => {
  assert(value !== undefined)

  return value as Exclude<T, undefined>
}

type RuleMetaData = {
  docs?: Pick<Exclude<Rule.RuleMetaData['docs'], undefined>, 'description' | 'url'> | undefined
} & Omit<Rule.RuleMetaData, 'docs'>

type LooseRuleDefinition =
  | {
      meta?: RuleMetaData | undefined
      schema?: RuleMetaData['schema']
    }
  | LooseRuleCreateFunction
  | undefined

export const listRules = (): Array<[string, LooseRuleDefinition]> => [
  ...Object.entries(eslint.configs.all.rules).map(
    ([key]) => [key, {}] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(plugins.json.rules).map(
    ([key, value]) => [`json/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(ok(plugins.perfectionist.rules)).map(
    ([key, value]) => [`perfectionist/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(plugins.regexp.rules).map(
    ([key, value]) => [`regexp/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(ok(plugins.tsdoc.rules)).map(
    ([key, value]) => [`tsdoc/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(ok(plugins.unicorn.rules)).map(
    ([key, value]) => [`unicorn/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(ok(plugins.vue.rules)).map(
    ([key, value]) => [`vue/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(plugins.yaml.rules).map(
    ([key, value]) => [`yaml/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(plugins.stylistic.rules).map(
    ([key, value]) => [`stylistic/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(plugins.typescript.rules ?? {}).map(
    ([key, value]) => [`typescript/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
  ...Object.entries(plugins['vue-a11y'].rules).map(
    ([key, value]) => [`vue-a11y/${key}`, value] satisfies [string, LooseRuleDefinition],
  ),
]

export const rulesVueIncluded = normalizeRules({
  'vue/block-order': [
    'error',
    {
      order: [['script', 'template'], 'style'],
    },
  ],
  'vue/component-definition-name-casing': ['error', 'PascalCase'],
  'vue/component-name-in-template-casing': [
    'error',
    'PascalCase',
    {
      ignores: [],
      registeredComponentsOnly: true,
    },
  ],
  'vue/component-options-name-casing': ['error', 'PascalCase'],
  'vue/custom-event-name-casing': ['error', 'camelCase'],
  'vue/define-macros-order': [
    'error',
    {
      defineExposeLast: false,
      order: ['defineProps', 'defineEmits'],
    },
  ],
  'vue/multi-word-component-names': 'off',
  'vue/no-boolean-default': ['error', 'default-false'],
  'vue/no-empty-component-block': 'error',
  'vue/no-ref-object-reactivity-loss': 'error',
  'vue/no-required-prop-with-default': [
    'error',
    {
      autofix: true,
    },
  ],
  'vue/no-setup-props-reactivity-loss': 'error',
  'vue/prop-name-casing': ['error', 'camelCase'],
})

export const rulesVueDefaults: Record<string, RuleEntry> = pickBy(
  normalizeRules(
    ...compose(
      ...(ok(plugins.vue.configs)['flat/base'] as TSESLint.FlatConfig.Config[]),
      ...(ok(plugins.vue.configs)['flat/essential'] as TSESLint.FlatConfig.Config[]),
      ...(ok(plugins.vue.configs)['flat/recommended'] as TSESLint.FlatConfig.Config[]),
      ...(ok(plugins.vue.configs)['flat/strongly-recommended'] as TSESLint.FlatConfig.Config[]),
      ...eslintPluginVueA11y.configs['flat/recommended'].map((value) => ({ rules: value.rules })),
      {
        rules: pickBy(
          eslintConfigPrettier.rules,
          (_, key) => key.startsWith('vue/') || key.startsWith('vue-a11y/'),
        ),
      },
    ).map((value) => value.rules),
  ),
)

export const rulesVue = { ...rulesVueDefaults, ...rulesVueIncluded }

const rulesTypescriptDisable = [
  'typescript/ban-types',
  'typescript/consistent-indexed-object-style',
  'typescript/explicit-function-return-type',
  'array-callback-return',
  'camelcase',
  'no-duplicate-imports',
  'no-loop-func',
  'no-shadow',
  'no-useless-return',
  'no-void',
  'perfectionist/sort-exports',
  'perfectionist/sort-imports',
  'perfectionist/sort-named-exports',
  'perfectionist/sort-named-imports',
  'perfectionist/sort-vue-attributes',
]

// prettier-ignore
export const rulesTypescriptIncluded: Record<string, RuleEntry> = {
  'accessor-pairs': ['error', { enforceForClassMembers: true, setWithoutGet: true }],
  'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],
  'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
  'constructor-super': 'error',
  'default-case-last': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'new-cap': ['error', { capIsNew: false, newIsCap: true, properties: true }],
  'no-const-assign': 'error',
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-dupe-args': 'error',
  'no-dupe-keys': 'error',
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-func-assign': 'error',
  'no-implied-eval': 'error',
  'no-import-assign': 'error',
  'no-iterator': 'error',
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'no-lone-blocks': 'error',
  'no-multi-str': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
  'typescript/array-type': ['error', { default: 'array-simple' }],
  'typescript/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
  'typescript/consistent-type-definitions': ['error', 'interface'],
  'typescript/consistent-type-imports': ['error', { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports', prefer: 'type-imports' }],
  'typescript/dot-notation': ['error', { allowKeywords: true }],
  'typescript/method-signature-style': 'error',
  'typescript/naming-convention': ['error', { format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allowSingleOrDouble', selector: 'variableLike', trailingUnderscore: 'allowSingleOrDouble' }],
  'typescript/no-dupe-class-members': 'off',
  'typescript/no-dynamic-delete': 'error',
  'typescript/no-empty-interface': ['error', { allowSingleExtends: true }],
  'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],
  'typescript/no-import-type-side-effects': 'error',
  'typescript/no-invalid-void-type': 'error',
  'typescript/no-loop-func': 'error',
  'typescript/no-loss-of-precision': ['error'],
  'typescript/no-mixed-enums': 'error',
  'typescript/no-non-null-assertion': 'error',
  'typescript/no-redeclare': ['error', { builtinGlobals: false }],
  'typescript/no-this-alias': ['error', { allowDestructuring: true }],
  'typescript/no-unnecessary-boolean-literal-compare': 'error',
  'typescript/no-unnecessary-qualifier': 'error',
  'typescript/no-unnecessary-type-arguments': 'error',
  'typescript/no-unused-expressions': ['error', { allowShortCircuit: true, allowTaggedTemplates: true, allowTernary: true }],
  'typescript/no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all' }],
  'typescript/no-use-before-define': ['error', { classes: false, enums: false, functions: false, typedefs: false, variables: false }],
  'typescript/no-useless-constructor': ['error'],
  'typescript/no-useless-empty-export': 'error',
  'typescript/only-throw-error': 'error',
  'typescript/prefer-includes': 'error',
  'typescript/prefer-nullish-coalescing': ['error', { ignoreConditionalTests: false, ignoreMixedLogicalExpressions: false }],
  'typescript/prefer-readonly': 'error',
  'typescript/prefer-reduce-type-parameter': 'error',
  'typescript/prefer-ts-expect-error': 'error',
  'typescript/promise-function-async': 'error',
  'typescript/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
  'typescript/return-await': ['error', 'always'],
  'typescript/strict-boolean-expressions': ['error', { allowAny: false, allowNullableBoolean: false, allowNullableNumber: false, allowNullableObject: false, allowNullableString: false, allowNumber: false, allowString: false }],
  'typescript/triple-slash-reference': ['error', { lib: 'never', path: 'never', types: 'never' }],
  'typescript/unified-signatures': 'error',
  // 'no-new-symbol': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-obj-calls': 'error',
  'no-object-constructor': 'error',
  'no-octal-escape': 'error',
  'no-proto': 'error',
  'no-return-assign': ['error', 'except-parens'],
  'no-self-assign': ['error', { props: true }],
  'no-self-compare': 'error',
  'no-sequences': 'error',
  'no-this-before-super': 'error',
  'no-unexpected-multiline': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  'no-unreachable': 'error',
  'no-unreachable-loop': 'error',
  'no-unsafe-negation': 'error',
  'no-useless-call': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-rename': 'error',
  'object-shorthand': ['warn', 'properties'],
  'one-var': ['error', { initialized: 'never' }],
  'perfectionist/sort-interfaces': ['warn', { "ignore-case": false, 'optionality-order': 'required-first', "order": "asc", 'partition-by-new-line': true, "type": "alphabetical", }],
  'perfectionist/sort-object-types': ['warn', { "ignore-case": false, "order": "asc", 'partition-by-new-line': true, "type": "alphabetical", }],
  'perfectionist/sort-objects': ['warn', { "ignore-case": false, "order": "asc", 'partition-by-comment': true, 'partition-by-new-line': true, "type": "alphabetical", }],
  'perfectionist/sort-union-types': ['warn', { "ignore-case": false, 'nullable-last': true, "order": "asc", "type": "alphabetical" }],
  'prefer-const': ['error', { destructuring: 'all' }],
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'regexp/sort-alternatives': 'warn',
  'regexp/unicode-escape': [
    'error',
    'unicodeCodePointEscape', // or "unicodeEscape"
  ],
  'regexp/unicode-property': [
    'error',
    {
      generalCategory: 'never',
      key: 'ignore',
      property: {
        binary: 'ignore',
        generalCategory: 'ignore',
        script: 'long',
      },
    },
  ],
  'stylistic/no-mixed-operators': ['warn', { allowSamePrecedence: true, groups: [['&', '|', '^', '~', '<<', '>>', '>>>'], ['==', '!=', '===', '!==', '>', '>=', '<', '<='], ['&&', '||'], ['in', 'instanceof']] }],
  'stylistic/wrap-iife': 'warn',
  'symbol-description': 'error',
  'tsdoc/syntax': 'warn',
  // 'unicorn/better-regex': 'off',
  'unicorn/consistent-function-scoping': 'error',
  'unicorn/error-message': 'error',
  'unicorn/no-instanceof-array': 'error',
  'unicorn/no-keyword-prefix': 'off',
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-typeof-undefined': 'error',
  'unicorn/no-useless-fallback-in-spread': 'error',
  'unicorn/no-zero-fractions': 'error',
  'unicorn/numeric-separators-style': 'error',
  'unicorn/prefer-blob-reading-methods': 'error',
  'unicorn/prefer-event-target': 'error',
  'unicorn/prefer-modern-math-apis': 'error',
  'unicorn/prefer-node-protocol': 'error',
  'unicorn/prefer-reflect-apply': 'error',
  'unicorn/prefer-ternary': 'error',
  'unicorn/prefer-type-error': 'error',
  'unicorn/prevent-abbreviations': 'error',
  'use-isnan': ['error', { enforceForIndexOf: true, enforceForSwitchCase: true }],
  'valid-typeof': ['error', { requireStringLiterals: true }],
  yoda: ['error', 'never'],
  ...(Object.assign(
    {},
    ...rulesTypescriptDisable.map((value) => ({ [value]: 'off' }))
  ) as Record<string, 'off'>)
}

export const rulesTypescriptDefaults = normalizeRules(
  ...compose(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    plugins.stylistic.configs['disable-legacy'],
    eslintConfigPerfectionist as TSESLint.FlatConfig.Config,
    plugins.regexp.configs['flat/recommended'] as TSESLint.FlatConfig.Config,
    eslintConfigPrettier,
  ).map((value) => value.rules),
)

export const rulesTypescript = normalizeRules(rulesTypescriptDefaults, rulesTypescriptIncluded)

export const rulesJavascript = normalizeRules(
  rulesTypescriptDefaults,
  rulesTypescriptIncluded,
  ...compose(tseslint.configs.disableTypeChecked).map((value) => value.rules),
  { 'tsdoc/syntax': 'off' },
)

export const rulesYAMLDefaults = normalizeRules(
  ...compose(
    ...plugins.yaml.configs['flat/base'],
    ...plugins.yaml.configs['flat/recommended'],
    ...plugins.yaml.configs['flat/prettier'],
  ).map((value) => value.rules),
)

export const rulesYAMLIncluded = normalizeRules({
  'yaml/block-mapping-colon-indicator-newline': 'error',
  'yaml/block-mapping-question-indicator-newline': 'error',
  'yaml/block-sequence-hyphen-indicator-newline': 'error',
  'yaml/file-extension': 'error',
  'yaml/flow-mapping-curly-newline': 'error',
  'yaml/flow-sequence-bracket-newline': 'error',
  'yaml/no-empty-mapping-value': 'off',
  'yaml/no-multiple-empty-lines': 'error',
  'yaml/no-trailing-zeros': 'error',
  'yaml/sort-keys': [
    'error',
    {
      allowLineSeparatedGroups: true,
      minKeys: 2,
      order: { caseSensitive: true, natural: false, type: 'asc' },
      pathPattern: '.*',
    },
  ],
  'yaml/spaced-comment': 'error',
})

export const rulesYAML = { ...rulesYAMLDefaults, ...rulesYAMLIncluded }

export const [rulesJSONDefaults, rulesJSON5Defaults, rulesJSONCDefaults] = (
  [
    'flat/recommended-with-json',
    'flat/recommended-with-json5',
    'flat/recommended-with-jsonc',
  ] as const
).map(
  (key): Record<string, RuleEntry> =>
    normalizeRules(
      ...compose(...plugins.json.configs[key], ...plugins.json.configs['flat/prettier']).map(
        (value) => value.rules,
      ),
    ),
)

export const rulesJSONIncluded = normalizeRules({
  'json/no-floating-decimal': 'error',
  'json/sort-keys': [
    'error',
    {
      allowLineSeparatedGroups: true,
      minKeys: 2,
      order: { caseSensitive: true, natural: false, type: 'asc' },
      pathPattern: '.*',
    },
  ],
  'json/space-unary-ops': 'error',
})

export const [rulesJSON, rulesJSON5, rulesJSONC] = (
  [rulesJSONDefaults, rulesJSON5Defaults, rulesJSONCDefaults] as const
).map(
  (object): Record<string, RuleEntry> => ({
    ...mapValues(rulesJSONDefaults, () => 'off'),
    ...object,
    ...rulesJSONIncluded,
  }),
)
