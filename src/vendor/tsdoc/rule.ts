/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See ./LICENSE for license information.
 */

import {
  TSDocConfiguration as TSDocumentConfiguration,
  TSDocParser as TSDocumentParser,
  type ParserContext,
} from '@microsoft/tsdoc'
import type { TSDocConfigFile as TSDocumentConfigFile } from '@microsoft/tsdoc-config'
import type { Rule, SourceCode } from 'eslint'

import { getTsDocumentTextRange } from './comments'
import { getConfigForSourceFile } from './config-cache'
import { getRootDirectoryFromContext, type RuleContext } from './context'

interface ConfigFileForRule {
  fileNotFound: boolean
  hasErrors: boolean
  configureParser: (configuration: TSDocumentConfiguration) => void
  getErrorSummary: () => string
}

type RuleDocumentation = { category: string } & NonNullable<Rule.RuleMetaData['docs']>

export type TsDocumentConfigLoader = (
  sourceFilePath: string,
  tsConfigRootDirectory?: string,
) => ConfigFileForRule

interface SyntaxRuleOptions {
  loadConfigForSourceFile?: TsDocumentConfigLoader
}

const CONFIG_ERROR_LOCATION = { column: 1, line: 1 } as const

const tsDocumentMessageIds: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    new TSDocumentConfiguration().allTsdocMessageIds.map((messageId: string) => [
      messageId,
      `${messageId}: {{unformattedText}}`,
    ]),
  ),
)

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const reportConfigurationError = (
  context: Rule.RuleContext,
  details: string,
  messageId: 'error-applying-config' | 'error-loading-config-file',
): void => {
  context.report({
    data: {
      details,
    },
    loc: CONFIG_ERROR_LOCATION,
    messageId,
  })
}

const ruleDocumentation: RuleDocumentation = {
  // Retained for compatibility with the vendored upstream plugin metadata; ESLint no longer types this field.
  category: 'Stylistic Issues',
  description: 'Validates that TypeScript documentation comments conform to the TSDoc standard',
  // This package is experimental.
  recommended: false,
  url: 'https://tsdoc.org/pages/packages/eslint-plugin-tsdoc',
}

export const createSyntaxRule = ({
  loadConfigForSourceFile = getConfigForSourceFile,
}: SyntaxRuleOptions = {}): Rule.RuleModule => ({
  meta: {
    docs: ruleDocumentation,
    messages: {
      'error-applying-config': 'Error applying TSDoc configuration: {{details}}',
      'error-loading-config-file': 'Error loading TSDoc config file:\n{{details}}',
      ...tsDocumentMessageIds,
    },
    type: 'problem',
  },
  create: (context: Rule.RuleContext) => {
    const sourceFilePath = context.filename
    // If ESLint is configured with @typescript-eslint/parser, there is a parser option
    // to explicitly specify where the tsconfig file is. Use that if available.
    const tsConfigRootDirectory = getRootDirectoryFromContext(context as unknown as RuleContext)

    const tsDocumentConfiguration: TSDocumentConfiguration = new TSDocumentConfiguration()

    try {
      const tsDocumentConfigFile: ConfigFileForRule | TSDocumentConfigFile =
        loadConfigForSourceFile(sourceFilePath, tsConfigRootDirectory)
      if (!tsDocumentConfigFile.fileNotFound) {
        if (tsDocumentConfigFile.hasErrors) {
          reportConfigurationError(
            context,
            tsDocumentConfigFile.getErrorSummary(),
            'error-loading-config-file',
          )
        }

        try {
          tsDocumentConfigFile.configureParser(tsDocumentConfiguration)
        } catch (error) {
          reportConfigurationError(context, getErrorMessage(error), 'error-applying-config')
        }
      }
    } catch (error) {
      reportConfigurationError(
        context,
        `Unexpected exception: ${getErrorMessage(error)}`,
        'error-loading-config-file',
      )
    }

    const tsDocumentParser: TSDocumentParser = new TSDocumentParser(tsDocumentConfiguration)

    const sourceCode: SourceCode = context.sourceCode
    function checkCommentBlocks(): void {
      for (const comment of sourceCode.getAllComments()) {
        const textRange = getTsDocumentTextRange(sourceCode, comment)
        if (textRange === undefined) {
          continue
        }

        const parserContext: ParserContext = tsDocumentParser.parseRange(textRange)
        for (const message of parserContext.log.messages) {
          context.report({
            data: {
              unformattedText: message.unformattedText,
            },
            loc: {
              end: sourceCode.getLocFromIndex(message.textRange.end),
              start: sourceCode.getLocFromIndex(message.textRange.pos),
            },
            messageId: message.messageId,
          })
        }
      }
    }

    return {
      Program: checkCommentBlocks,
    }
  },
})
