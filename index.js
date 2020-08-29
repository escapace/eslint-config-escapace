module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: ['@typescript-eslint', 'no-null'],
  extends: [
    'standard-with-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
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
    'use-isnan': 'error'
  }
}
