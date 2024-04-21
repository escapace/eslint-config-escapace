# eslint-config-escapace

Install the correct versions of each package

```sh
pnpm install --save-dev eslint eslint-config-escapace
```

Add the extends to `eslint.config.mjs`:

```js
import config from 'eslint-config-escapace'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  ...config
)
```
