/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See ./LICENSE for license information.
 */

import { describe, expect, it } from 'vitest'
import { getRootDirectoryFromContext, type RuleContext } from './context'

const createRootDirectoryContext = (context: object): RuleContext =>
  ({
    cwd: '/cwd',
    languageOptions: { parserOptions: {} },
    parserOptions: {},
    sourceCode: {},
    ...context,
  }) as unknown as RuleContext

describe('getRootDirectoryFromContext', () => {
  it('uses the TypeScript compiler baseUrl before all fallback directories', () => {
    const context = createRootDirectoryContext({
      cwd: '/cwd',
      parserOptions: { tsconfigRootDir: '/legacy-root' },
      sourceCode: {
        parserServices: {
          program: {
            getCompilerOptions: () => ({ baseUrl: '/base-url' }),
            getCurrentDirectory: () => '/current-directory',
          },
        },
      },
    })

    expect(getRootDirectoryFromContext(context)).toBe('/base-url')
  })

  it('uses the TypeScript compiler current directory when baseUrl is absent', () => {
    const context = createRootDirectoryContext({
      sourceCode: {
        parserServices: {
          program: {
            getCompilerOptions: () => ({}),
            getCurrentDirectory: () => '/current-directory',
          },
        },
      },
    })

    expect(getRootDirectoryFromContext(context)).toBe('/current-directory')
  })

  it('uses flat-config parserOptions before legacy parserOptions', () => {
    const context = createRootDirectoryContext({
      languageOptions: { parserOptions: { tsconfigRootDir: '/flat-root' } },
      parserOptions: { tsconfigRootDir: '/legacy-root' },
    })

    expect(getRootDirectoryFromContext(context)).toBe('/flat-root')
  })

  it('uses legacy parserOptions before cwd', () => {
    const context = createRootDirectoryContext({
      cwd: '/cwd',
      parserOptions: { tsconfigRootDir: '/legacy-root' },
    })

    expect(getRootDirectoryFromContext(context)).toBe('/legacy-root')
  })

  it('uses getCwd when no parser option or cwd property is available', () => {
    const context = createRootDirectoryContext({
      cwd: undefined,
      getCwd: () => '/method-cwd',
    })

    expect(getRootDirectoryFromContext(context)).toBe('/method-cwd')
  })
})
