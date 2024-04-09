# eslint-config-escapace

Install the correct versions of each package

```sh
(
    export PKG=eslint-config-escapace;
    npm info "$PKG@latest" peerDependencies --json | jq -r 'to_entries[] | "\"\(.key)@\(.value)\"" // empty' | xargs pnpm install --save-dev "$PKG@latest"
)
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
