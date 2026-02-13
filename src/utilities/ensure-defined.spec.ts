import { expect, it } from 'vitest'
import { ensureDefined } from './ensure-defined'

it('returns defined root value', () => {
  expect(ensureDefined('value')).toBe('value')
})

it('returns defined nested value', () => {
  expect(ensureDefined({ a: { b: 'value' } }, 'a', 'b')).toBe('value')
})

it('throws for missing nested value', () => {
  expect(() => ensureDefined({ a: {} }, 'a', 'b')).toThrow(
    'Expected value at path "a.b" to be defined',
  )
})
