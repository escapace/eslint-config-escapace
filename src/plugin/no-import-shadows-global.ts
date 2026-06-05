import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from './internal/create-rule'
import { jsGlobals } from './internal/js-globals'

type MessageIds = 'shadowsGlobal'

export type Options = [{ additionalGlobals?: string[] }]

const defaultOptions: Options = [{}]

export default createRule<Options, MessageIds>({
  defaultOptions,
  meta: {
    docs: {
      description:
        'Disallow binding an imported name that collides with a built-in JavaScript global.',
    },
    messages: {
      shadowsGlobal:
        "Imported binding '{{name}}' shadows the global '{{name}}'. Rename the local binding or use a namespace subpath import.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          additionalGlobals: {
            description: 'Additional names treated as globals (e.g. DOM or Node identifiers).',
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
  name: 'no-import-shadows-global',
  create(context, [options]) {
    const extra = new Set(options.additionalGlobals ?? [])

    const check = (
      node:
        | TSESTree.ImportDefaultSpecifier
        | TSESTree.ImportNamespaceSpecifier
        | TSESTree.ImportSpecifier,
    ): void => {
      const local = node.local
      const name = local.name
      if (jsGlobals.has(name) || extra.has(name)) {
        context.report({ data: { name }, messageId: 'shadowsGlobal', node: local })
      }
    }

    return {
      ImportDefaultSpecifier: check,
      ImportNamespaceSpecifier: check,
      ImportSpecifier: check,
    }
  },
})
