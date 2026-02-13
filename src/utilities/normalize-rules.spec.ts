import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import { ensurePreset } from './ensure-preset'
import { extractRules } from './extract-rules'
import { normalizeRules } from './normalize-rules'

describe('normalizeRules', () => {
  describe('severity normalization', () => {
    it('converts numeric 0 to "off"', () => {
      expect(normalizeRules({ 'no-eval': 0 })).toEqual({ 'no-eval': 'off' })
    })

    it('converts numeric 1 to "warn"', () => {
      expect(normalizeRules({ 'no-eval': 1 })).toEqual({ 'no-eval': 'warn' })
    })

    it('converts numeric 2 to "error"', () => {
      expect(normalizeRules({ 'no-eval': 2 })).toEqual({ 'no-eval': 'error' })
    })

    it('passes through string "off"', () => {
      expect(normalizeRules({ 'no-eval': 'off' })).toEqual({ 'no-eval': 'off' })
    })

    it('passes through string "warn"', () => {
      expect(normalizeRules({ 'no-eval': 'warn' })).toEqual({ 'no-eval': 'warn' })
    })

    it('passes through string "error"', () => {
      expect(normalizeRules({ 'no-eval': 'error' })).toEqual({ 'no-eval': 'error' })
    })

    it('normalizes numeric severity in array form', () => {
      expect(normalizeRules({ 'no-eval': [2] })).toEqual({ 'no-eval': ['error'] })
    })

    it('preserves options after severity in array form', () => {
      expect(normalizeRules({ eqeqeq: [2, 'always', { null: 'ignore' }] })).toEqual({
        eqeqeq: ['error', 'always', { null: 'ignore' }],
      })
    })

    it('preserves options with string severity', () => {
      expect(normalizeRules({ eqeqeq: ['warn', 'smart'] })).toEqual({
        eqeqeq: ['warn', 'smart'],
      })
    })
  })

  describe('perfectionist special case', () => {
    it('downgrades numeric 2 to "warn" for perfectionist rules', () => {
      expect(normalizeRules({ 'perfectionist/sort-imports': 2 })).toEqual({
        'perfectionist/sort-imports': 'warn',
      })
    })

    it('downgrades string "error" to "warn" for perfectionist rules', () => {
      expect(normalizeRules({ 'perfectionist/sort-objects': 'error' })).toEqual({
        'perfectionist/sort-objects': 'warn',
      })
    })

    it('downgrades severity in array form for perfectionist rules', () => {
      expect(
        normalizeRules({ 'perfectionist/sort-objects': [2, { type: 'alphabetical' }] }),
      ).toEqual({
        'perfectionist/sort-objects': ['warn', { type: 'alphabetical' }],
      })
    })

    it('does not affect "off" for perfectionist rules', () => {
      expect(normalizeRules({ 'perfectionist/sort-imports': 'off' })).toEqual({
        'perfectionist/sort-imports': 'off',
      })
    })

    it('does not affect non-perfectionist rules at error level', () => {
      expect(normalizeRules({ 'no-eval': 2 })).toEqual({ 'no-eval': 'error' })
    })
  })

  describe('key aliasing', () => {
    it('renames @typescript-eslint/ to typescript/', () => {
      expect(normalizeRules({ '@typescript-eslint/no-unused-vars': 'error' })).toEqual({
        'typescript/no-unused-vars': 'error',
      })
    })

    it('renames vuejs-accessibility/ to vue-a11y/', () => {
      expect(normalizeRules({ 'vuejs-accessibility/alt-text': 'error' })).toEqual({
        'vue-a11y/alt-text': 'error',
      })
    })

    it('renames yml/ to yaml/', () => {
      expect(normalizeRules({ 'yml/sort-keys': 'warn' })).toEqual({
        'yaml/sort-keys': 'warn',
      })
    })

    it('renames jsonc/ to json/', () => {
      expect(normalizeRules({ 'jsonc/no-comments': 'error' })).toEqual({
        'json/no-comments': 'error',
      })
    })

    it('renames @stylistic/ to stylistic/', () => {
      expect(normalizeRules({ '@stylistic/comma-dangle': 'warn' })).toEqual({
        'stylistic/comma-dangle': 'warn',
      })
    })

    it('drops @babel/ prefixed rules', () => {
      expect(normalizeRules({ '@babel/semi': 'error' })).toEqual({})
    })

    it('drops react/ prefixed rules', () => {
      expect(normalizeRules({ 'react/jsx-uses-react': 'error' })).toEqual({})
    })

    it('passes through unaliased keys unchanged', () => {
      expect(normalizeRules({ 'no-eval': 'error', 'unicorn/no-null': 'warn' })).toEqual({
        'no-eval': 'error',
        'unicorn/no-null': 'warn',
      })
    })
  })

  describe('merging and filtering', () => {
    it('returns empty object for no arguments', () => {
      expect(normalizeRules()).toEqual({})
    })

    it('returns empty object when all arguments are undefined', () => {
      expect(normalizeRules(undefined, undefined)).toEqual({})
    })

    it('skips undefined entries within a rules object', () => {
      expect(normalizeRules({ 'no-alert': undefined, 'no-eval': 'error' })).toEqual({
        'no-eval': 'error',
      })
    })

    it('later objects override earlier ones', () => {
      expect(normalizeRules({ 'no-eval': 'error' }, { 'no-eval': 'off' })).toEqual({
        'no-eval': 'off',
      })
    })

    it('merges multiple rule objects', () => {
      expect(normalizeRules({ 'no-alert': 'warn' }, { 'no-eval': 'error' })).toEqual({
        'no-alert': 'warn',
        'no-eval': 'error',
      })
    })

    it('skips undefined objects in arguments', () => {
      expect(normalizeRules(undefined, { 'no-eval': 'error' }, undefined)).toEqual({
        'no-eval': 'error',
      })
    })
  })
})

const config = (rules: Linter.RulesRecord): Linter.Config => ({ rules })

describe('extractRules', () => {
  it('extracts rules from flat configs', () => {
    const result = extractRules(config({ 'no-eval': 'error' }))

    expect(result).toEqual([{ 'no-eval': 'error' }])
  })

  it('extracts rules from nested config arrays', () => {
    const result = extractRules([config({ 'no-eval': 'error' }), config({ 'no-alert': 'warn' })])

    expect(result).toEqual([{ 'no-eval': 'error' }, { 'no-alert': 'warn' }])
  })

  it('handles mixed flat and nested configs', () => {
    const result = extractRules(config({ a: 'off' }), [config({ b: 'error' })])

    expect(result).toEqual([{ a: 'off' }, { b: 'error' }])
  })

  it('skips undefined entries', () => {
    const result = extractRules(undefined, config({ a: 'error' }), undefined)

    expect(result).toEqual([{ a: 'error' }])
  })

  it('returns undefined for configs without rules', () => {
    const noRules: Linter.Config = { plugins: {} }
    const result = extractRules(noRules)

    expect(result).toEqual([undefined])
  })

  it('returns empty array for no arguments', () => {
    expect(extractRules()).toEqual([])
  })
})

describe('ensurePreset', () => {
  it('returns a single config wrapped in an array', () => {
    const config = { rules: { a: 'error' } }
    const result = ensurePreset({ myPreset: config }, 'myPreset')

    expect(result).toEqual([config])
  })

  it('returns an array config as-is', () => {
    const configs = [{ rules: { a: 'error' } }, { rules: { b: 'warn' } }]
    const result = ensurePreset({ myPreset: configs }, 'myPreset')

    expect(result).toEqual(configs)
  })

  it('throws for undefined config object', () => {
    expect(() => ensurePreset(undefined, 'x')).toThrow()
  })

  it('throws for missing key', () => {
    expect(() => ensurePreset({}, 'missing')).toThrow()
  })
})
