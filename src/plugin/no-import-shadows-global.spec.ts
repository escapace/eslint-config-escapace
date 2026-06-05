import { afterAll, describe, it } from 'vitest'

import rule from './no-import-shadows-global'
import {
  asEslintRule,
  createPluginRuleTesterPlain,
  installRuleTesterBindings,
} from './internal/rule-tester'

const ruleTesterIt = ((name: unknown, run?: () => void) => {
  // eslint-disable-next-line vitest/valid-title
  it(String(name), run, 60_000)
}) as unknown as typeof it

const restore = installRuleTesterBindings(describe, ruleTesterIt)
const tester = createPluginRuleTesterPlain()

// eslint-disable-next-line vitest/prefer-hooks-on-top
afterAll(restore)

tester.run('escapace/no-import-shadows-global', asEslintRule(rule), {
  invalid: [
    {
      code: "import { Array } from 'effect'",
      errors: [{ data: { name: 'Array' }, messageId: 'shadowsGlobal' }],
    },
    {
      code: "import Map from 'immutable'",
      errors: [{ data: { name: 'Map' }, messageId: 'shadowsGlobal' }],
    },
    {
      code: "import * as Date from 'date-fns'",
      errors: [{ data: { name: 'Date' }, messageId: 'shadowsGlobal' }],
    },
    {
      code: "import { Buffer } from 'node:buffer'",
      errors: [{ data: { name: 'Buffer' }, messageId: 'shadowsGlobal' }],
      options: [{ additionalGlobals: ['Buffer'] }],
    },
  ],
  valid: [
    "import { Array as Arr } from 'effect'",
    "import * as Arr from 'effect/Array'",
    'function f(Array: number) { return Array + 1 }',
    "import { something } from 'effect'",
    "import effect from 'effect'",
    "import { Buffer } from 'node:buffer'",
  ],
})
