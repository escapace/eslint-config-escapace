import { Linter } from 'eslint'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { compose, escapace } from './index'

// Integration test: load the composed escapace config and run it against
// fixtures that import from `effect@beta`. Verifies the rule wiring described
// in REPORT.md / TODO.md §4.2 — that the rules are registered, ordered, and
// composed correctly with the rest of the preset.

const repoNodeModules = path.resolve(import.meta.dirname, '../node_modules')

let rootDirectory: string
let linter: Linter
// `compose(escapace())` returns the typescript-eslint flat-config flavor, which
// is structurally identical to ESLint's `Linter.Config` but uses a different
// type definition. Treating it as `unknown[]` here keeps the boundary in one
// place; `Linter.verify` accepts the runtime shape.
let config: unknown[]

beforeAll(async () => {
  rootDirectory = mkdtempSync(path.join(tmpdir(), 'eslint-config-escapace-effect-'))
  writeFileSync(
    path.join(rootDirectory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'esnext',
        moduleResolution: 'bundler',
        skipLibCheck: true,
        strict: true,
        target: 'es2022',
      },
      include: ['./**/*.ts'],
    }),
  )
  symlinkSync(repoNodeModules, path.join(rootDirectory, 'node_modules'), 'dir')

  const composed = await compose(escapace())
  // Rewrite projectService to point at our fixture tsconfig and drop the
  // gitignore + repo-level `ignores` entries that target the source tree.
  config = composed
    .filter(
      (entry) =>
        !Array.isArray((entry as { ignores?: unknown }).ignores) || Object.keys(entry).length !== 1,
    )
    .map((entry) => {
      const parserOptions = entry.languageOptions?.parserOptions
      if (parserOptions?.projectService === undefined) {
        return entry
      }
      return {
        ...entry,
        languageOptions: {
          ...entry.languageOptions,
          parserOptions: {
            ...parserOptions,
            projectService: { defaultProject: 'tsconfig.json' },
            tsconfigRootDir: rootDirectory,
          },
        },
      }
    })
  linter = new Linter({ cwd: rootDirectory })
})

afterAll(() => {
  if (rootDirectory !== undefined) {
    rmSync(rootDirectory, { force: true, recursive: true })
  }
})

const lintFixture = (relativeFilename: string, code: string): Linter.LintMessage[] => {
  const filePath = path.join(rootDirectory, relativeFilename)
  writeFileSync(filePath, code)
  return linter.verify(code, config as Linter.Config[], { filename: filePath })
}

const ruleIds = (messages: Linter.LintMessage[]): string[] =>
  messages.map((message) => message.ruleId ?? `<${message.message}>`)

describe('escapace config against effect@beta', () => {
  it(
    'allows namespace subpath import (`import * as Arr from "effect/Array"`)',
    { timeout: 60_000 },
    () => {
      const messages = lintFixture('subpath.ts', `import * as Arr from 'effect/Array'\nvoid Arr\n`)
      expect(ruleIds(messages)).not.toContain('escapace/no-import-shadows-global')
      expect(ruleIds(messages)).not.toContain('unicorn/prevent-abbreviations')
    },
  )

  it('flags `import { Array } from "effect"` as a global shadow', { timeout: 60_000 }, () => {
    const messages = lintFixture('shadow-array.ts', `import { Array } from 'effect'\nvoid Array\n`)
    expect(ruleIds(messages)).toContain('escapace/no-import-shadows-global')
  })

  it(
    'does not flag `Effect.gen(function*() { return 42 })` (require-yield is disabled)',
    { timeout: 60_000 },
    () => {
      const messages = lintFixture(
        'no-yield-gen.ts',
        `import * as Effect from 'effect/Effect'\nvoid Effect.gen(function*() { return 42 })\n`,
      )
      expect(ruleIds(messages)).not.toContain('require-yield')
    },
  )

  it('flags `Effect.fnUntraced` directly', { timeout: 60_000 }, () => {
    const messages = lintFixture(
      'fn-untraced.ts',
      `import * as Effect from 'effect/Effect'\nvoid Effect.fnUntraced(function*() { return 42 })\n`,
    )
    expect(ruleIds(messages)).toContain('escapace/no-effect-untraced')
  })

  it(
    'keeps known false negatives from the Effect-TS language-service matcher',
    { timeout: 60_000 },
    () => {
      const barrelMessages = lintFixture(
        'fn-untraced-barrel.ts',
        `import * as Effect from 'effect'\nvoid Effect.fnUntraced(function*() { return 42 })\n`,
      )
      expect(ruleIds(barrelMessages)).not.toContain('escapace/no-effect-untraced')

      const namedMessages = lintFixture(
        'fn-untraced-named.ts',
        `import { fnUntraced } from 'effect/Effect'\nvoid fnUntraced(function*() { return 42 })\n`,
      )
      expect(ruleIds(namedMessages)).not.toContain('escapace/no-effect-untraced')
    },
  )

  it(
    'does not apply the type-aware Effect wrapper rules to untyped javascript files',
    { timeout: 60_000 },
    () => {
      const messages = lintFixture(
        'untyped-effect.js',
        `import * as Effect from 'effect/Effect'\nvoid Effect.fnUntraced(function*() { return 42 })\nvoid Effect.gen(function*() {\n  const inc = (n) => n + 1\n  return inc(1)\n})\n`,
      )
      expect(ruleIds(messages)).not.toContain('escapace/no-effect-untraced')
      expect(ruleIds(messages)).not.toContain('escapace/consistent-function-scoping')
    },
  )

  it(
    'does not flag inner helper inside `Effect.gen` (consistent-function-scoping)',
    { timeout: 60_000 },
    () => {
      const messages = lintFixture(
        'inner-helper.ts',
        `import * as Effect from 'effect/Effect'\nvoid Effect.gen(function*() {\n  const inc = (n: number) => n + 1\n  return inc(1)\n})\n`,
      )
      expect(ruleIds(messages)).not.toContain('escapace/consistent-function-scoping')
      expect(ruleIds(messages)).not.toContain('unicorn/consistent-function-scoping')
    },
  )

  it(
    'resolves Effect wrappers through a local re-export of `effect/Effect`',
    { timeout: 60_000 },
    () => {
      writeFileSync(path.join(rootDirectory, 'effect-proxy.ts'), `export * from 'effect/Effect'\n`)

      const untracedMessages = lintFixture(
        'reexport-untraced.ts',
        `import * as Effect from './effect-proxy'\nvoid Effect.fnUntraced(function*() { return 42 })\n`,
      )
      expect(ruleIds(untracedMessages)).toContain('escapace/no-effect-untraced')

      const scopedMessages = lintFixture(
        'reexport-gen.ts',
        `import * as Effect from './effect-proxy'\nvoid Effect.gen(function*() {\n  const inc = (n: number) => n + 1\n  return inc(1)\n})\n`,
      )
      expect(ruleIds(scopedMessages)).not.toContain('escapace/consistent-function-scoping')
    },
  )

  it(
    'does not treat unrelated wrappers with the same names as Effect APIs',
    { timeout: 60_000 },
    () => {
      writeFileSync(
        path.join(rootDirectory, 'task-proxy.ts'),
        `export const fnUntraced = <T>(value: T) => value\nexport const gen = <T>(value: T) => value\n`,
      )

      const messages = lintFixture(
        'unrelated-wrapper.ts',
        `import * as Task from './task-proxy'\nvoid Task.fnUntraced(function*() { return 42 })\nvoid Task.gen(function*() {\n  const inc = (n: number) => n + 1\n  return inc(1)\n})\n`,
      )
      expect(ruleIds(messages)).not.toContain('escapace/no-effect-untraced')
      expect(ruleIds(messages)).toContain('escapace/consistent-function-scoping')
    },
  )
})
