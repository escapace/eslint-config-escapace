# eslint-config-escapace

Single-entry ESLint baseline for consistent linting across code, tests, and configuration files. Covers TypeScript and JavaScript, optional Vue support, Vitest defaults, YAML including GitHub Actions workflows, TOML, JSON variants, plus `package.json` dependency constraints.

## Install

```sh
pnpm add -D eslint eslint-config-escapace
```

## Usage

Create `eslint.config.mjs`:

```js
import { escapace } from 'eslint-config-escapace'

export default escapace()
```

Defaults include `.gitignore`-aware ignoring and support for `.eslintignore` and `.lintignore`, plus Prettier compatibility via `eslint-config-prettier`.

## Options

All options are optional.

- `typescript`: adjustments for TypeScript
- `javascript`: adjustments for JavaScript
- `vue`: Vue-related adjustments

Example: enable Vue and adjust one Vue rule:

```js
import { escapace } from 'eslint-config-escapace'

export default escapace({
  vue: {
    enabled: true,
    rules: {
      'vue/max-template-depth': ['error', { maxDepth: 10 }],
    },
  },
})
```

## Composition

`compose` combines multiple config pieces into a single ESLint configuration.

```js
import { compose, escapace } from 'eslint-config-escapace'

export default compose(escapace(), {
  rules: {
    'unicorn/prevent-abbreviations': 'off',
  },
})
```
