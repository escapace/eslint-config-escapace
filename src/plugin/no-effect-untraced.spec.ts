import { afterAll, describe, it } from 'vitest'

import rule from './no-effect-untraced'
import {
  asEslintRule,
  createPluginRuleTesterPlain,
  createPluginRuleTesterTypeAware,
  installRuleTesterBindings,
} from './internal/rule-tester'

const timeout = 120_000

const ruleTesterIt = ((name: unknown, run?: () => void) => {
  // eslint-disable-next-line vitest/valid-title
  it(String(name), run, timeout)
}) as unknown as typeof it

const restore = installRuleTesterBindings(describe, ruleTesterIt)
const plainTester = createPluginRuleTesterPlain()
const typeAwareTester = createPluginRuleTesterTypeAware()

// eslint-disable-next-line vitest/prefer-hooks-on-top
afterAll(restore)

plainTester.run('escapace/no-effect-untraced without type information', asEslintRule(rule), {
  invalid: [],
  valid: [
    {
      code: `
        import * as Effect from 'effect/Effect'
        const load = Effect.fnUntraced(function*() { return 1 })
      `,
    },
  ],
})

typeAwareTester.run('escapace/no-effect-untraced', asEslintRule(rule), {
  invalid: [
    {
      code: `
        import * as Effect from 'effect/Effect'
        const load = Effect.fnUntraced(function*() { return 1 })
      `,
      errors: [{ messageId: 'noEffectUntraced' }],
      filename: 'virtual.ts',
    },
    {
      code: `
        import * as Eff from 'effect/Effect'
        const load = Eff.fnUntraced(function*() { return 1 })
      `,
      errors: [{ messageId: 'noEffectUntraced' }],
      filename: 'virtual.ts',
    },
  ],
  valid: [
    {
      code: `
        import * as Effect from 'effect/Effect'
        const load = Effect.fn(function*() { return 1 })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        const Task = { fnUntraced: (work: unknown) => work }
        const load = Task.fnUntraced(function*() { return 1 })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        import * as Effect from 'effect'
        const load = Effect.fnUntraced(function*() { return 1 })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        import { fnUntraced } from 'effect/Effect'
        const load = fnUntraced(function*() { return 1 })
      `,
      filename: 'virtual.ts',
    },
  ],
})
