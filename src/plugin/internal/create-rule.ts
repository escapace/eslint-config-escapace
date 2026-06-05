import { ESLintUtils } from '@typescript-eslint/utils'

// All rules in this plugin share a common docs URL prefix. The repo does not
// host per-rule docs pages yet, so the URL points at the source file.
export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/escapace/eslint-config-escapace/blob/trunk/src/plugin/${name}.ts`,
)
