# eslint-config-escapace

>  eslint configuration

[![build status](https://secure.travis-ci.org/escapace/eslint-config-escapace.png)](https://travis-ci.org/escapace/eslint-config-escapace)
[![license](https://img.shields.io/badge/license-Mozilla%20Public%20License%20Version%202.0-blue.svg)]()

## Usage

Install the correct versions of each package, which are listed by the command:

```sh
npm info "eslint-config-escapace@latest" peerDependencies
```

Linux/OSX users can simply run

```sh
(
    export PKG=eslint-config-escapace;
    npm info "$PKG@latest" peerDependencies --json | jq -r 'to_entries[] | "\"\(.key)@\(.value)\"" // empty' | xargs npm install --save-dev "$PKG@latest"
)
```

Alternatively either install all the peer dependencies manually, or use
the [install-peerdeps](https://github.com/nathanhleung/install-peerdeps) cli
tool.

```sh
npm install -g install-peerdeps
install-peerdeps --dev eslint-config-escapace
```

Finally, add the extends to .eslintrc.js:

```javascript
// .eslintrc.js
'use strict'

module.exports = {
    'extends': 'escapace'
}
```
