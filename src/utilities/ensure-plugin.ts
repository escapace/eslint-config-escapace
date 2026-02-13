import type { ESLint } from 'eslint'
import assert from 'node:assert'

/** Resolves CJS/ESM default-export interop and asserts the result is a valid ESLint plugin. */
export function ensurePlugin(value: unknown): ESLint.Plugin {
  // Unwrap CJS/ESM interop: if the module has a .default that looks like a plugin, use it.
  const unwrapped =
    value != null && typeof value === 'object' && 'default' in value
      ? (value as Record<string, unknown>).default
      : value
  const resolved = typeof unwrapped === 'object' && unwrapped !== null ? unwrapped : value

  assert(resolved != null && typeof resolved === 'object', 'Expected an object')
  assert(
    'rules' in resolved && typeof resolved.rules === 'object' && resolved.rules !== null,
    'Expected a plugin with rules',
  )

  return resolved as ESLint.Plugin
}
