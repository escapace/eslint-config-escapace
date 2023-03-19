# eslint-config-escapace

Install the correct versions of each package

```sh
(
    export PKG=eslint-config-escapace;
    npm info "$PKG@latest" peerDependencies --json | jq -r 'to_entries[] | "\"\(.key)@\(.value)\"" // empty' | xargs pnpm install --save-dev "$PKG@latest"
)
```

Add the extends to `.eslintrc.json`:

```json
{
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "extends": ["escapace"]
}
```
