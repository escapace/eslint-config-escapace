import { type Rule, RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'

// typescript-eslint's `RuleCreator` returns a richer `RuleModule` than the
// ESLint 10 `RuleDefinition` type that `RuleTester.run` expects. The runtime
// shape is identical; only the contextual generic parameters disagree. This
// helper isolates the type-only adapter in one place.
export const asEslintRule = (rule: unknown): Rule.RuleModule => rule as Rule.RuleModule

const previousDescribe = RuleTester.describe
const previousIt = RuleTester.it

export const installRuleTesterBindings = (
  describe_: typeof RuleTester.describe,
  it_: typeof RuleTester.it,
): (() => void) => {
  RuleTester.describe = describe_
  RuleTester.it = it_
  return () => {
    RuleTester.describe = previousDescribe
    RuleTester.it = previousIt
  }
}

export const createPluginRuleTesterPlain = (): RuleTester =>
  new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  })

export const createPluginRuleTesterTypeAware = (): RuleTester =>
  new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        project: false,
        projectService: {
          allowDefaultProject: [
            '*.cjs',
            '*.cts',
            '*.js',
            '*.jsx',
            '*.mjs',
            '*.mts',
            '*.ts',
            '*.tsx',
          ],
          defaultProject: 'tsconfig.json',
        },
        sourceType: 'module',
        tsconfigRootDir: process.cwd(),
      },
    },
  })
