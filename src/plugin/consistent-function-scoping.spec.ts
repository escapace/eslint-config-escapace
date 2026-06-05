import { afterAll, describe, it } from 'vitest'

import rule from './consistent-function-scoping'
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

plainTester.run(
  'escapace/consistent-function-scoping without type information',
  asEslintRule(rule),
  {
    invalid: [],
    valid: [
      {
        code: `
          import * as Effect from 'effect/Effect'
          Effect.gen(function*() {
            const inc = (x: number) => x + 1
            return inc(1)
          })
        `,
      },
    ],
  },
)

typeAwareTester.run('escapace/consistent-function-scoping', asEslintRule(rule), {
  invalid: [
    {
      code: `
        function outer() {
          function inner() {
            return 1
          }
          return inner()
        }
      `,
      errors: [{ messageId: 'consistent-function-scoping' }],
      filename: 'virtual.ts',
    },
    {
      code: `
        const Task = { gen: (work: unknown) => work }
        Task.gen(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      errors: [{ messageId: 'consistent-function-scoping' }],
      filename: 'virtual.ts',
    },
    {
      code: `
        const fn = (work: unknown) => work
        fn(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      errors: [{ messageId: 'consistent-function-scoping' }],
      filename: 'virtual.ts',
    },
    {
      code: `
        import { gen } from 'effect/Effect'
        gen(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      errors: [{ messageId: 'consistent-function-scoping' }],
      filename: 'virtual.ts',
    },
  ],
  valid: [
    {
      code: `
        import * as Effect from 'effect/Effect'
        Effect.gen(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        import * as Eff from 'effect/Effect'
        Eff.gen(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        import * as Effect from 'effect/Effect'
        Effect.fn('work')(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        import * as Effect from 'effect/Effect'
        Effect.fnUntraced(function*() {
          const inc = (x: number) => x + 1
          return inc(1)
        })
      `,
      filename: 'virtual.ts',
    },
    {
      code: `
        function outer(y: number) {
          function inner() {
            return y
          }
          return inner()
        }
      `,
      filename: 'virtual.ts',
    },
  ],
})
