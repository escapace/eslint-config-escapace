import { describe, expect, it } from 'vitest'

import { jsGlobals } from './js-globals'

describe('jsGlobals', () => {
  it(
    'contains the JavaScript global names that consumer imports commonly shadow',
    { timeout: 60_000 },
    () => {
      for (const name of ['Array', 'Map', 'Set', 'Promise', 'Symbol', 'Date', 'globalThis']) {
        expect(jsGlobals.has(name)).toBe(true)
      }
    },
  )

  it('does not include names that are not built-in globals', { timeout: 60_000 }, () => {
    for (const name of ['Effect', 'Stream', 'pipe', 'fn']) {
      expect(jsGlobals.has(name)).toBe(false)
    }
  })
})
