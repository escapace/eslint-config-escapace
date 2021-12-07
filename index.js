module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    sourceType: 'script'
  },
  reportUnusedDisableDirectives: true,
  plugins: ['no-null', 'editorconfig'],
  extends: [
    'eslint:recommended',
    'standard',
    'plugin:eslint-comments/recommended',
    'plugin:unicorn/recommended',
    'plugin:node/recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'prettier'
  ],
  overrides: [
    {
      files: ['.*.js'],
      rules: {
        'max-lines': 0,
        'no-magic-numbers': 0,
        'node/no-unpublished-require': 0
      }
    },
    {
      files: ['*.mjs'],
      parserOptions: {
        sourceType: 'module'
      },
      rules: {
        'import/extensions': [2, 'always']
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'standard-with-typescript'
      ]
    }
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx']
      },
      typescript: {
        alwaysTryTypes: true
      }
    },
    node: {
      tryExtensions: ['.js', '.ts', '.d.ts']
    }
  },
  rules: {
    'no-void': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/prefer-includes': 0,
    '@typescript-eslint/return-await': 0,
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false
        }
      }
    ],
    indent: 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true }
    ],
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    'dot-notation': 'error',
    eqeqeq: 'error',
    'linebreak-style': ['error', 'unix'],
    'new-parens': 'error',
    'no-caller': 'error',
    'no-duplicate-case': 'error',
    'no-duplicate-imports': 'error',
    'no-empty': 'error',
    'no-eval': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-return-await': 'error',
    'no-sparse-arrays': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-unsafe-finally': 'error',
    'no-unused-expressions': ['error', { allowTernary: true }],
    'no-unused-labels': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-object-spread': 'error',
    'quote-props': ['error', 'as-needed'],
    'space-in-parens': 'error',
    'unicode-bom': ['error', 'never'],
    'use-isnan': 'error',

    'eslint-comments/no-unused-disable': 0,
    'eslint-comments/no-use': [
      2,
      {
        allow: [
          'eslint-disable-next-line',
          'eslint-disable',
          'eslint-enable',
          'eslint-env'
        ]
      }
    ],

    'node/shebang': 0,
    'unicorn/custom-error-definition': 2,
    'unicorn/no-unused-properties': 2,
    'unicorn/explicit-length-check': [2, { 'non-zero': 'not-equal' }],
    // Too strict
    'unicorn/no-null': 0,
    'unicorn/no-array-reduce': 0,
    'unicorn/no-array-for-each': 0,
    'unicorn/prefer-module': 0,
    'unicorn/prefer-object-from-entries': 0,
    // Conflicts with no-unresolved and no-missing-import
    'unicorn/prefer-node-protocol': 0,
    // This rule gives too many false positives
    'unicorn/prevent-abbreviations': 0,
    // Conflicts with Prettier sometimes
    'unicorn/number-literal-case': 0,
    // Conflicts with the core ESLint `prefer-destructuring` rule
    'unicorn/no-unreadable-array-destructuring': 0,
    // Not useful for us
    'unicorn/expiring-todo-comments': 0,
    'unicorn/no-array-callback-reference': 0,
    // TODO: enable those rules
    'unicorn/no-process-exit': 0,
    'unicorn/import-style': 0
  }
}
