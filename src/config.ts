import eslint from '@eslint/js'
import { mapValues, pickBy } from 'es-toolkit/compat'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import type { RuleEntry, Rules } from './types'
import { normalizeRules, ensurePreset, extractRules } from './utilities/normalize-rules'
import { pluginsAll } from './utilities/plugins'

const plugins = await pluginsAll()

export const rulesVueIncluded = normalizeRules({
  'vue/block-order': [
    'error',
    {
      order: [['script', 'template'], 'style'],
    },
  ],
  'vue/comma-dangle': [
    'warn',
    {
      arrays: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
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
      order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
    },
  ],
  'vue/enforce-style-attribute': ['error', { allow: ['scoped', 'plain'] }],
  'vue/first-attribute-linebreak': 'off',
  'vue/multi-word-component-names': 'off',
  'vue/no-boolean-default': ['error', 'default-false'],
  'vue/no-empty-component-block': 'error',
  'vue/no-loss-of-precision': 'error',
  'vue/no-ref-object-reactivity-loss': 'error',
  'vue/no-required-prop-with-default': [
    'error',
    {
      autofix: true,
    },
  ],
  'vue/no-restricted-syntax': ['error', 'DebuggerStatement', 'LabeledStatement', 'WithStatement'],
  'vue/no-setup-props-reactivity-loss': 'error',
  'vue/no-sparse-arrays': 'error',
  'vue/no-unused-refs': 'error',
  'vue/no-useless-v-bind': 'error',
  'vue/padding-line-between-blocks': ['warn', 'always'],
  'vue/prop-name-casing': ['error', 'camelCase'],
})

export const rulesVueDefaults: Record<string, RuleEntry> = pickBy(
  normalizeRules(
    ...extractRules(
      ensurePreset(plugins.vue.configs, 'flat/base'),
      ensurePreset(plugins.vue.configs, 'flat/essential'),
      ensurePreset(plugins.vue.configs, 'flat/recommended'),
      ensurePreset(plugins.vue.configs, 'flat/strongly-recommended'),
      ensurePreset(plugins['vue-a11y'].configs, 'flat/recommended'),
      {
        rules: pickBy(
          prettierConfig.rules,
          (_, key) => key.startsWith('vue/') || key.startsWith('vue-a11y/'),
        ),
      },
    ),
  ),
)

export const rulesVue = { ...rulesVueDefaults, ...rulesVueIncluded }

const rulesTypescriptDisable = [
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
  'typescript/triple-slash-reference',
  'typescript/adjacent-overload-signatures',
  'typescript/consistent-indexed-object-style',
  'typescript/explicit-function-return-type',
  'typescript/sort-type-constituents',
  'typescript/prefer-for-of',
  'typescript/no-dynamic-delete',
  'typescript/no-non-null-assertion',
]

export const rulesDepend: Rules = {
  'depend/ban-dependencies': [
    'error',
    {
      allowed: ['es-toolkit', 'execa'],
      presets: ['microutilities', 'preferred'],
    },
  ],
}

const perfectionistOptions = {
  ignoreCase: false,
  order: 'asc',
  partitionByComment: true,
  partitionByNewLine: true,
  type: 'alphabetical',
} as const

// prettier-ignore
export const rulesTypescriptIncluded: Rules = {
  // "typescript/only-throw-error": "error",
  // "typescript/prefer-includes": "error",
  // 'no-new-symbol': 'error',
  ...rulesDepend,
  'de-morgan/no-negated-conjunction': 'error',
  'de-morgan/no-negated-disjunction': 'error',

  'accessor-pairs': ['error', { enforceForClassMembers: true, setWithoutGet: true }],
  'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],
  'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
  'constructor-super': 'error',
  'default-case-last': 'error',
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
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
  'no-labels': ['error', { allowLoop: true, allowSwitch: false }],
  'no-lone-blocks': 'error',
  'no-multi-str': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
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
  'object-shorthand': ['warn', 'always'],
  'one-var': ['error', { initialized: 'never' }],
  'perfectionist/sort-array-includes': ['warn', perfectionistOptions],
  'perfectionist/sort-classes': [
    'warn',
    {
      ...perfectionistOptions,
      groups: [
        "index-signature",

        // Static state
        ["static-property", "static-accessor-property"],
        "optional-static-property",
        "static-block",

        // Instance state
        ["property", "accessor-property"],
        "optional-property",

        "constructor",

        // Behavior: static then instance, required-ish then optional-ish
        ["static-method", "static-function-property"],
        ["optional-static-method", "optional-static-function-property"],
        ["method", "function-property"],
        ["optional-method", "optional-function-property"],

        "unknown",
      ],
    },
  ],
  'perfectionist/sort-interfaces': [
    'warn',
    {
      ...perfectionistOptions,
      groups: [
        "index-signature",

        // required (implicitly) → optional
        "property",
        "optional-property",
        "method",
        "optional-method",

        // keep big shapes last; optional-big last of all
        "multiline-member",
        "optional-multiline-member",

        "unknown",
      ],
    },
  ],
  'perfectionist/sort-maps': ['warn', perfectionistOptions],
  'perfectionist/sort-object-types': [
    'warn',
    {
      ...perfectionistOptions,
      groups: [
        "index-signature",
        "property",
        "optional-property",
        "method",
        "optional-method",
        "multiline-member",
        "optional-multiline-member",
        "unknown",
      ],
    },
  ],
  'perfectionist/sort-objects': [
    'warn',
    {
      ...perfectionistOptions,
      groups: ["property", "method", "multiline-member", "unknown"],
    },
  ],
  'perfectionist/sort-union-types': [
    'warn',
    {
      ...perfectionistOptions,
      groups: [
        'conditional',
        'function',
        'import',
        'intersection',
        'keyword',
        'literal',
        'named',
        'object',
        'operator',
        'tuple',
        'union',
        'nullish',
        'unknown',
      ],
    },
  ],
  'prefer-const': ['error', { destructuring: 'all' }],
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'regexp/sort-alternatives': 'warn',
  'regexp/unicode-escape': [
    'error',
    'unicodeCodePointEscape', // or 'unicodeEscape'
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
  'stylistic/comma-dangle': [
    'warn',
    {
      arrays: 'always-multiline',
      enums: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
      generics: 'always-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
      tuples: 'always-multiline',
    },
  ],
  'stylistic/multiline-ternary': ['warn', 'always-multiline'],
  'stylistic/no-mixed-operators': ['warn', { allowSamePrecedence: true, groups: [['&', '|', '^', '~', '<<', '>>', '>>>'], ['==', '!=', '===', '!==', '>', '>=', '<', '<='], ['&&', '||'], ['in', 'instanceof']] }],
  'stylistic/wrap-iife': 'warn',
  'symbol-description': 'error',
  'tsdoc/syntax': 'warn',
  'typescript/array-type': ['error', { default: 'array-simple' }],
  'typescript/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
  'typescript/consistent-type-definitions': ['error', 'interface'],
  'typescript/consistent-type-imports': ['error', { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports', prefer: 'type-imports' }],
  'typescript/dot-notation': ['error', { allowKeywords: true }],
  'typescript/method-signature-style': 'error',
  'typescript/naming-convention': ['error', { format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allowSingleOrDouble', selector: 'variableLike', trailingUnderscore: 'allowSingleOrDouble' }],
  'typescript/no-dupe-class-members': 'off',
  'typescript/no-empty-interface': ['error', { allowSingleExtends: true }],
  'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],
  'typescript/no-import-type-side-effects': 'error',
  'typescript/no-invalid-void-type': 'error',
  'typescript/no-loop-func': 'error',
  'typescript/no-loss-of-precision': ['error'],
  'typescript/no-mixed-enums': 'error',
  'typescript/no-redeclare': ['error', { builtinGlobals: false }],
  'typescript/no-this-alias': ['error', { allowDestructuring: true }],
  'typescript/no-unnecessary-boolean-literal-compare': 'error',
  'typescript/no-unnecessary-qualifier': 'error',
  'typescript/no-unnecessary-type-arguments': 'error',
  'typescript/no-unused-expressions': ['error', { allowShortCircuit: true, allowTaggedTemplates: true, allowTernary: true }],
  'typescript/no-unused-vars': ['error', { args: 'none', argsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all', varsIgnorePattern: '^_' }],
  'typescript/no-use-before-define': ['error', { classes: false, enums: false, functions: false, typedefs: false, variables: false }],
  'typescript/no-useless-constructor': ['error'],
  'typescript/no-useless-empty-export': 'error',
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
  'unicorn/consistent-function-scoping': 'error',
  'unicorn/error-message': 'error',
  'unicorn/no-instanceof-array': 'error',
  'unicorn/no-keyword-prefix': 'off',
  'unicorn/no-negation-in-equality-check': 'error',
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-typeof-undefined': 'error',
  'unicorn/no-useless-fallback-in-spread': 'error',
  'unicorn/no-zero-fractions': 'error',
  'unicorn/numeric-separators-style': 'error',
  'unicorn/prefer-bigint-literals': 'warn',
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
    ...rulesTypescriptDisable.map((value) => ({ [value]: 'off' })),
  ) as Record<string, 'off'>),
}

export const rulesTypescriptDefaults = normalizeRules(
  ...extractRules(
    eslint.configs.recommended,
    ensurePreset(tseslint.configs, 'recommendedTypeChecked'),
    ensurePreset(tseslint.configs, 'stylisticTypeChecked'),
    ensurePreset(plugins.stylistic.configs, 'disable-legacy'),
    ensurePreset(plugins.perfectionist.configs, 'recommended-alphabetical'),
    ensurePreset(plugins.regexp.configs, 'flat/recommended'),
    prettierConfig,
  ),
)

export const rulesTypescript = normalizeRules(rulesTypescriptDefaults, rulesTypescriptIncluded)

export const rulesJavascript = normalizeRules(
  rulesTypescriptDefaults,
  rulesTypescriptIncluded,
  ...extractRules(ensurePreset(tseslint.configs, 'disableTypeChecked')),
  { 'tsdoc/syntax': 'off' },
)

export const rulesYAMLDefaults = normalizeRules(
  ...extractRules(
    ensurePreset(plugins.yaml.configs, 'flat/base'),
    ensurePreset(plugins.yaml.configs, 'flat/recommended'),
    ensurePreset(plugins.yaml.configs, 'flat/prettier'),
  ),
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
      ...extractRules(
        ensurePreset(plugins.json.configs, key),
        ensurePreset(plugins.json.configs, 'flat/prettier'),
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

export const rulesTOMLDefaults = normalizeRules(
  ...extractRules(
    ensurePreset(plugins.toml.configs, 'flat/base'),
    ensurePreset(plugins.toml.configs, 'flat/recommended'),
    ensurePreset(plugins.toml.configs, 'flat/standard'),
  ),
)

export const rulesTOMLIncluded = normalizeRules({
  'toml/array-bracket-spacing': ['error', 'never'],
})

export const rulesTOML = { ...rulesTOMLDefaults, ...rulesTOMLIncluded }
