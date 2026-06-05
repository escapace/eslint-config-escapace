import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils'
import unicorn from 'eslint-plugin-unicorn'
import { createRule } from './internal/create-rule'
import { createEffectWrapperMatcher } from './internal/is-effect-wrapper'

const isAstNode = (value: unknown): value is TSESTree.Node =>
  typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string'

// Why: re-implementing unicorn's scope analysis would drift over time and add
// a second source of truth. Instead, delegate to the upstream rule via a
// proxied context whose `report` is intercepted for any function nested inside
// an Effect.gen/fn/fnUntraced body.

type MessageIds = 'consistent-function-scoping'

export type Options = [{ checkArrowFunctions?: boolean }]

const upstreamRule = unicorn.rules?.['consistent-function-scoping'] as
  | TSESLint.RuleModule<MessageIds, Options>
  | undefined

const isClosureFunction = (
  node: TSESTree.Node,
): node is
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration ||
  node.type === AST_NODE_TYPES.FunctionExpression

export default createRule<Options, MessageIds>({
  defaultOptions: [{ checkArrowFunctions: true }],
  meta: {
    docs: {
      description:
        'Move function definitions to the highest possible scope, except for closures inside Effect.gen/fn/fnUntraced bodies.',
    },
    messages: {
      'consistent-function-scoping': 'Move {{functionNameWithKind}} to the outer scope.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkArrowFunctions: {
            description: 'Whether to check arrow functions.',
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  name: 'consistent-function-scoping',
  create(context, [resolvedOptions]) {
    if (upstreamRule === undefined) {
      return {}
    }

    const effectWrappers = createEffectWrapperMatcher(context)
    if (!effectWrappers.isTypeAware) {
      return {}
    }

    const isInsideEffectGeneratorBody = (node: TSESTree.Node): boolean => {
      let current: TSESTree.Node | null | undefined = node.parent
      while (current !== undefined && current !== null) {
        if (
          isClosureFunction(current) &&
          effectWrappers.isInsideEffectWrapperArgument(current) !== undefined
        ) {
          return true
        }
        current = current.parent
      }
      return false
    }

    // Why: ESLint's RuleContext defines `options` as non-configurable, so a
    // Proxy `get` trap on it violates the invariant. Build a derived object
    // whose prototype is the original context, then override the writable
    // fields directly.
    const report = (descriptor: TSESLint.ReportDescriptor<MessageIds>): void => {
      const candidate = 'node' in descriptor ? descriptor.node : undefined
      if (isAstNode(candidate) && isInsideEffectGeneratorBody(candidate)) {
        return
      }
      context.report(descriptor)
    }

    const derived = Object.create(context, {
      options: { configurable: true, enumerable: true, value: [resolvedOptions] },
      report: { configurable: true, enumerable: true, value: report },
    }) as TSESLint.RuleContext<MessageIds, Options>

    return upstreamRule.create(derived)
  },
})
