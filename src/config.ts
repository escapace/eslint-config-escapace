import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import type { TSESLint } from '@typescript-eslint/utils'
import gitignore from 'eslint-config-flat-gitignore'
import prettierConfig from 'eslint-config-prettier'
import tseslint, { type ConfigWithExtends } from 'typescript-eslint'
import type { RuleEntry } from './types'
import { normalizeRules } from './utilities/normalize-rules'
// @ts-expect-error no-types
import unicorn from 'eslint-plugin-unicorn'
// @ts-expect-error no-types
import perfectionist from 'eslint-plugin-perfectionist/configs/recommended-alphabetical'

const disable = [
  '@typescript-eslint/ban-types',
  '@typescript-eslint/consistent-indexed-object-style',
  '@typescript-eslint/explicit-function-return-type',
  'camelcase',
  'no-duplicate-imports',
  'no-return-await',
  'no-useless-return',
  'array-callback-return',
  'no-void',
  'no-loop-func',
  'no-shadow',
  'perfectionist/sort-exports',
  'perfectionist/sort-imports',
  'perfectionist/sort-named-exports',
  'perfectionist/sort-named-imports'
]

// prettier-ignore
export const rules: Record<string, RuleEntry> = {
  '@stylistic/no-mixed-operators': ['error', { allowSamePrecedence: true, groups: [['&', '|', '^', '~', '<<', '>>', '>>>'], ['==', '!=', '===', '!==', '>', '>=', '<', '<='], ['&&', '||'], ['in', 'instanceof']] }],
  '@stylistic/wrap-iife': 'error',
  '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports', prefer: 'type-imports' }],
  '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],
  '@typescript-eslint/method-signature-style': 'error',
  '@typescript-eslint/naming-convention': ['error', { format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow', selector: 'variableLike', trailingUnderscore: 'allow' }],
  '@typescript-eslint/no-dupe-class-members': 'off',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
  '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-loss-of-precision': ['error'],
  '@typescript-eslint/no-mixed-enums': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-redeclare': ['error', { builtinGlobals: false }],
  '@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true }],
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTaggedTemplates: true, allowTernary: true }],
  '@typescript-eslint/no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all' }],
  '@typescript-eslint/no-use-before-define': ['error', { classes: false, enums: false, functions: false, typedefs: false, variables: false }],
  '@typescript-eslint/no-useless-constructor': ['error'],
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignoreConditionalTests: false, ignoreMixedLogicalExpressions: false }],
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-ts-expect-error': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
  '@typescript-eslint/return-await': ['error', 'always'],
  '@typescript-eslint/strict-boolean-expressions': ['error', { allowAny: false, allowNullableBoolean: false, allowNullableNumber: false, allowNullableObject: false, allowNullableString: false, allowNumber: false, allowString: false }],
  '@typescript-eslint/triple-slash-reference': ['error', { lib: 'never', path: 'never', types: 'never' }],
  '@typescript-eslint/unified-signatures': 'error',
  'accessor-pairs': ['error', { enforceForClassMembers: true, setWithoutGet: true }],
  'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],
  "arrow-body-style": ["error", "as-needed", { requireReturnForObjectLiteral: false }],
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
  'no-new-symbol': 'error',
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
  'prefer-const': ['error', { destructuring: 'all' }],
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'symbol-description': 'error',
  'unicorn/better-regex': 'error',
  'unicorn/consistent-function-scoping': 'error',
  'unicorn/error-message': 'error',
  'unicorn/no-instanceof-array': 'error',
  'unicorn/no-keyword-prefix': 'off',
  'unicorn/no-new-array': 'error',
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-typeof-undefined': 'error',
  'unicorn/no-useless-fallback-in-spread': 'error',
  'unicorn/no-zero-fractions': 'error',
  'unicorn/number-literal-case': 'error',
  'unicorn/numeric-separators-style': 'error',
  'unicorn/prefer-blob-reading-methods': 'error',
  'unicorn/prefer-event-target': 'error',
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
    ...disable.map((value) => ({ [value]: 'off' }))
  ) as Record<string, 'off'>)
}

export const rulesAll = normalizeRules(
  eslint.configs.all.rules,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  stylistic.configs['all-flat'].rules!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  stylistic.configs['recommended-flat'].rules!,
  ...tseslint.configs.all.map((value) => value.rules ?? []).flat(),
  ...tseslint.configs.stylisticTypeChecked
    .map((value) => value.rules ?? [])
    .flat(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  unicorn.configs['flat/all'].rules,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  perfectionist.rules
  // ...tseslint.configs.recommendedTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked
)

// the order matters here and should be the same as in config below
export const rulesIncludedByDefault = normalizeRules(
  eslint.configs.recommended.rules,
  ...tseslint.configs.recommendedTypeChecked
    .map((value) => value.rules ?? [])
    .flat(),
  ...tseslint.configs.stylisticTypeChecked
    .map((value) => value.rules ?? [])
    .flat(),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  stylistic.configs['disable-legacy'].rules!,
  prettierConfig.rules
)

const config: TSESLint.FlatConfig.ConfigArray = tseslint.config(
  gitignore({
    files: ['.gitignore', '.eslintignore'],
    strict: false
  }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  { plugins: { '@stylistic': stylistic, unicorn } },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  stylistic.configs['disable-legacy'],
  perfectionist as ConfigWithExtends,
  prettierConfig,
  {
    rules
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked
  }
)

export default config
