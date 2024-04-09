# eslint-config-escapace

Install the correct versions of each package

```sh
npm info "eslint-config-escapace@latest" peerDependencies --json | jq -r 'to_entries[] | "\"\(.key)@\(.value)\"" // empty' | xargs pnpm install --save-dev "eslint-config-escapace@latest"
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
