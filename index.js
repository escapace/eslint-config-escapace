module.exports = {
  extends: [
    'eslint-config-airbnb-base',
    'eslint-config-airbnb-base/rules/strict',
    'eslint-config-standard',
    'eslint-config-prettier'
  // Disabled due to possible issues with nodejs versions & es6 support
  // eslint-disable-next-line prefer-arrow-callback, func-names
  ].map(function (extension) {
    if (!extension.startsWith('plugin:')) {
      return require.resolve(extension)
    }

    return extension
  }),

  plugins: [
    'no-async-without-await'
  ],
  parser: 'babel-eslint',
  rules: {
    'no-async-without-await/no-async-without-await': 1
  }
}
