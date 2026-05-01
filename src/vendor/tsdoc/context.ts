/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See ./LICENSE for license information.
 */

import { ESLintUtils, type TSESLint } from '@typescript-eslint/utils'

export type RuleContext = TSESLint.RuleContext<string, unknown[]>

export const getRootDirectoryFromContext = (context: RuleContext): string | undefined => {
  let rootDirectory: string | undefined
  try {
    // Prefer type-aware parser services when available because they reflect the active TypeScript project.
    const parserServices =
      context.sourceCode.parserServices ?? ESLintUtils.getParserServices(context)
    const program = parserServices.program
    rootDirectory = program?.getCompilerOptions().baseUrl ?? program?.getCurrentDirectory()
  } catch {
    // Ignore the error if we cannot retrieve a TypeScript program.
  }

  // Fallback precedence preserves upstream compatibility: flat config, legacy config, cwd property, cwd method.
  if (rootDirectory === undefined || rootDirectory === '') {
    rootDirectory =
      context.languageOptions.parserOptions?.tsconfigRootDir ??
      context.parserOptions?.tsconfigRootDir ??
      context.cwd ??
      context.getCwd?.()
  }

  return rootDirectory
}
