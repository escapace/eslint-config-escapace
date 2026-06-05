import { createRule } from './internal/create-rule'
import { createEffectWrapperMatcher } from './internal/is-effect-wrapper'

type MessageIds = 'noEffectUntraced'

export type Options = []

export default createRule<Options, MessageIds>({
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Disallow `Effect.fnUntraced`; prefer traced `Effect.fn` wrappers.',
    },
    messages: {
      noEffectUntraced:
        'Avoid `Effect.fnUntraced`. Prefer `Effect.fn`, or disable `escapace/no-effect-untraced` at the call site when untraced execution is intentional.',
    },
    schema: [],
    type: 'suggestion',
  },
  name: 'no-effect-untraced',
  create(context) {
    const effectWrappers = createEffectWrapperMatcher(context)
    if (!effectWrappers.isTypeAware) {
      return {}
    }

    return {
      CallExpression(node) {
        if (effectWrappers.getEffectWrapperName(node) !== 'fnUntraced') {
          return
        }

        context.report({ messageId: 'noEffectUntraced', node })
      },
    }
  },
})
