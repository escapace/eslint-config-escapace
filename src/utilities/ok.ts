import assert from 'node:assert'

export const ok = <T>(value: T): Exclude<T, undefined> => {
  assert(value !== undefined)

  return value as Exclude<T, undefined>
}
