import { describe, expect, it } from 'vitest'

import tseslint from 'typescript-eslint'
import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils'
import { createEffectWrapperMatcher } from './is-effect-wrapper'

const attachParents = (node: TSESTree.Node, parent?: TSESTree.Node): void => {
  node.parent = parent

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') {
      continue
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        if (child !== null && typeof child === 'object' && 'type' in child) {
          attachParents(child as TSESTree.Node, node)
        }
      }
      continue
    }

    if (value !== null && typeof value === 'object' && 'type' in value) {
      attachParents(value as TSESTree.Node, node)
    }
  }
}

type ParserServices = TSESLint.SourceCode['parserServices']

type ParseForESLint = (
  code: string,
  options: Record<string, unknown>,
) => { ast: TSESTree.Program; services?: ParserServices }

const parser = tseslint.parser as unknown as { parseForESLint: ParseForESLint }

const parseForESLint: ParseForESLint = (code, options) => parser.parseForESLint(code, options)

const createMatcher = (code: string, parserOptions: Record<string, unknown> = {}) => {
  const { ast, services } = parseForESLint(code, {
    ecmaVersion: 'latest',
    filePath: 'virtual.ts',
    project: false,
    projectService: {
      allowDefaultProject: ['*.ts'],
      defaultProject: 'tsconfig.json',
    },
    sourceType: 'module',
    tsconfigRootDir: process.cwd(),
    ...parserOptions,
  })

  const program = ast
  attachParents(program)

  const context = {
    sourceCode: {
      ast: program,
      parserServices: services,
    },
  } as unknown as TSESLint.RuleContext<string, readonly unknown[]>

  return { ast: program, matcher: createEffectWrapperMatcher(context) }
}

const firstCallExpression = (program: TSESTree.Program): TSESTree.CallExpression => {
  const statement = program.body.find(
    (node): node is TSESTree.ExpressionStatement =>
      node.type === AST_NODE_TYPES.ExpressionStatement,
  )
  if (statement?.expression.type !== AST_NODE_TYPES.CallExpression) {
    throw new Error('expected top-level CallExpression')
  }
  return statement.expression
}

const firstGeneratorArgument = (call: TSESTree.CallExpression): TSESTree.FunctionExpression => {
  // eslint-disable-next-line baseline-js/use-baseline
  const [firstArgument] = call.arguments
  if (firstArgument?.type !== AST_NODE_TYPES.FunctionExpression || !firstArgument.generator) {
    throw new Error('expected first generator argument')
  }
  return firstArgument
}

const timeout = 120_000

describe('createEffectWrapperMatcher', () => {
  it('is a no-op without type information', { timeout }, () => {
    const { ast, matcher } = createMatcher(
      "import * as Effect from 'effect/Effect'\nEffect.gen(function*(){})",
      {
        projectService: false,
      },
    )

    expect(matcher.isTypeAware).toBe(false)
    expect(matcher.getEffectWrapperName(firstCallExpression(ast))).toBeUndefined()
  })

  it('matches namespace imports from `effect/Effect` with type information', { timeout }, () => {
    const direct = createMatcher(
      "import * as Effect from 'effect/Effect'\nEffect.gen(function*(){})",
    )
    expect(direct.matcher.isTypeAware).toBe(true)
    expect(direct.matcher.getEffectWrapperName(firstCallExpression(direct.ast))).toBe('gen')

    const curried = createMatcher(
      "import * as Effect from 'effect/Effect'\nEffect.fn('name')(function*(){})",
    )
    expect(curried.matcher.getEffectWrapperName(firstCallExpression(curried.ast))).toBe('fn')
  })

  it(
    'does not match known false negatives such as barrel imports, bare named imports, or unrelated member access',
    { timeout },
    () => {
      const barrelImport = createMatcher(
        "import * as Effect from 'effect'\nEffect.fnUntraced(function*(){})",
      )
      expect(
        barrelImport.matcher.getEffectWrapperName(firstCallExpression(barrelImport.ast)),
      ).toBeUndefined()

      const namedImport = createMatcher("import { gen } from 'effect/Effect'\ngen(function*(){})")
      expect(
        namedImport.matcher.getEffectWrapperName(firstCallExpression(namedImport.ast)),
      ).toBeUndefined()

      const unrelatedMember = createMatcher(
        'const Task = { fnUntraced: (value: unknown) => value }\nTask.fnUntraced(function*(){})',
        { projectService: false },
      )
      expect(
        unrelatedMember.matcher.getEffectWrapperName(firstCallExpression(unrelatedMember.ast)),
      ).toBeUndefined()
    },
  )

  it('matches generator function arguments passed to recognized wrappers', { timeout }, () => {
    const direct = createMatcher(
      "import * as Effect from 'effect/Effect'\nEffect.gen(function*(){})",
    )
    const directCall = firstCallExpression(direct.ast)
    expect(direct.matcher.isInsideEffectWrapperArgument(firstGeneratorArgument(directCall))).toBe(
      'gen',
    )

    const curried = createMatcher(
      "import * as Effect from 'effect/Effect'\nEffect.fn('name')(function*(){})",
    )
    const curriedCall = firstCallExpression(curried.ast)
    expect(curried.matcher.isInsideEffectWrapperArgument(firstGeneratorArgument(curriedCall))).toBe(
      'fn',
    )
  })
})
