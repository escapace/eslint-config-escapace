import { AST_NODE_TYPES, ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils'
import type ts from 'typescript'

export type EffectWrapperName = 'fn' | 'fnUntraced' | 'gen'

export interface EffectWrapperMatcher {
  isTypeAware: boolean
  getEffectWrapperName: (call: TSESTree.CallExpression) => EffectWrapperName | undefined
  isInsideEffectWrapperArgument: (node: TSESTree.Node) => EffectWrapperName | undefined
}

type RuleContext = TSESLint.RuleContext<string, readonly unknown[]>

const wrapperNames: ReadonlySet<EffectWrapperName> = new Set(['fn', 'fnUntraced', 'gen'])

const isEffectWrapperName = (name: string): name is EffectWrapperName =>
  (wrapperNames as ReadonlySet<string>).has(name)

const tryGetParserServices = (
  context: RuleContext,
): ReturnType<typeof ESLintUtils.getParserServices> | undefined => {
  try {
    const parserServices = context.sourceCode.parserServices
    if (parserServices?.program !== undefined && parserServices.program !== null) {
      return parserServices as ReturnType<typeof ESLintUtils.getParserServices>
    }

    return ESLintUtils.getParserServices(context)
  } catch {
    return undefined
  }
}

const packageNameFromFilePath = (filePath: string): string | undefined => {
  const segments = filePath.replaceAll('\\', '/').split('/')

  for (let index = segments.length - 2; index >= 0; index -= 1) {
    if (segments[index] !== 'node_modules') {
      continue
    }

    const packageName = segments[index + 1]
    if (packageName === undefined || packageName === '') {
      return undefined
    }

    if (packageName.startsWith('@')) {
      const scopedLeaf = segments[index + 2]
      return scopedLeaf === undefined || scopedLeaf === ''
        ? undefined
        : `${packageName}/${scopedLeaf}`
    }

    return packageName
  }

  return undefined
}

const isGeneratorFunctionExpression = (node: TSESTree.Node): node is TSESTree.FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression && node.generator

const noTypeInfoMatcher: EffectWrapperMatcher = {
  isTypeAware: false,
  getEffectWrapperName: () => undefined,
  isInsideEffectWrapperArgument: () => undefined,
}

// `typescript` is available to the parser as a peer dependency, but this package
// must not bundle or import it at runtime. Mirror the enum value locally and keep
// the dependency type-only here.
const TYPE_SCRIPT_SYMBOL_FLAG_ALIAS = 2_097_152

const isAliasSymbol = (symbol: ts.Symbol): boolean =>
  (symbol.flags & TYPE_SCRIPT_SYMBOL_FLAG_ALIAS) !== 0

// Why: mirror Effect-TS language-service. It resolves the property-access symbol
// back to the `effect` package export instead of trusting local identifier text.
// Without checker-backed symbol resolution, the matcher is intentionally disabled.
export const createEffectWrapperMatcher = (context: RuleContext): EffectWrapperMatcher => {
  const parserServices = tryGetParserServices(context)
  const checker = parserServices?.program?.getTypeChecker()

  if (parserServices === undefined || checker === undefined) {
    return noTypeInfoMatcher
  }

  const callWrapperCache = new WeakMap<TSESTree.CallExpression, EffectWrapperName | null>()
  const moduleExportCache = new WeakMap<
    ts.Symbol,
    Partial<Record<EffectWrapperName, ts.Symbol | null>>
  >()
  const packageNameCache = new Map<string, string | undefined>()
  const resolvedSymbolCache = new WeakMap<ts.Symbol, ts.Symbol>()
  const symbolExportCache = new WeakMap<ts.Symbol, Partial<Record<EffectWrapperName, boolean>>>()

  const resolveAliasSymbol = (symbol: ts.Symbol): ts.Symbol => {
    const cached = resolvedSymbolCache.get(symbol)
    if (cached !== undefined) {
      return cached
    }

    let resolved = symbol
    while (isAliasSymbol(resolved)) {
      const next = checker.getAliasedSymbol(resolved)
      if (next === resolved) {
        break
      }
      resolved = next
    }

    resolvedSymbolCache.set(symbol, resolved)
    return resolved
  }

  const packageNameOfSourceFile = (fileName: string): string | undefined => {
    const cached = packageNameCache.get(fileName)
    if (cached !== undefined || packageNameCache.has(fileName)) {
      return cached
    }

    const packageName = packageNameFromFilePath(fileName)
    packageNameCache.set(fileName, packageName)
    return packageName
  }

  const moduleExportSymbol = (
    moduleSymbol: ts.Symbol,
    exportName: EffectWrapperName,
  ): ts.Symbol | undefined => {
    const cached = moduleExportCache.get(moduleSymbol)?.[exportName]
    if (cached !== undefined) {
      return cached ?? undefined
    }

    const exported = checker
      .getExportsOfModule(moduleSymbol)
      .find((candidate) => String(candidate.escapedName) === exportName)

    const record = moduleExportCache.get(moduleSymbol) ?? {}
    record[exportName] = exported ?? null
    moduleExportCache.set(moduleSymbol, record)

    return exported
  }

  const isTypedEffectModuleExport = (
    member: TSESTree.MemberExpression,
    exportName: EffectWrapperName,
  ): boolean => {
    const symbol = checker.getSymbolAtLocation(parserServices.esTreeNodeToTSNodeMap.get(member))
    if (symbol === undefined) {
      return false
    }

    const resolvedSymbol = resolveAliasSymbol(symbol)
    const cached = symbolExportCache.get(resolvedSymbol)?.[exportName]
    if (cached !== undefined) {
      return cached
    }

    let matches = false

    for (const declaration of resolvedSymbol.declarations ?? []) {
      const sourceFile = declaration.getSourceFile()
      if (packageNameOfSourceFile(sourceFile.fileName) !== 'effect') {
        continue
      }

      const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
      if (moduleSymbol === undefined) {
        continue
      }

      const exported = moduleExportSymbol(moduleSymbol, exportName)
      if (exported === undefined) {
        continue
      }

      if (resolveAliasSymbol(exported) === resolvedSymbol) {
        matches = true
        break
      }
    }

    const record = symbolExportCache.get(resolvedSymbol) ?? {}
    record[exportName] = matches
    symbolExportCache.set(resolvedSymbol, record)
    return matches
  }

  const memberWrapperName = (member: TSESTree.MemberExpression): EffectWrapperName | undefined => {
    if (
      member.computed ||
      member.property.type !== AST_NODE_TYPES.Identifier ||
      !isEffectWrapperName(member.property.name)
    ) {
      return undefined
    }

    const exportName = member.property.name
    return isTypedEffectModuleExport(member, exportName) ? exportName : undefined
  }

  const directWrapperName = (call: TSESTree.CallExpression): EffectWrapperName | undefined =>
    call.callee.type === AST_NODE_TYPES.MemberExpression
      ? memberWrapperName(call.callee)
      : undefined

  const curriedWrapperName = (call: TSESTree.CallExpression): EffectWrapperName | undefined =>
    call.callee.type === AST_NODE_TYPES.CallExpression &&
    call.callee.callee.type === AST_NODE_TYPES.MemberExpression
      ? memberWrapperName(call.callee.callee)
      : undefined

  const getEffectWrapperName = (call: TSESTree.CallExpression): EffectWrapperName | undefined => {
    const cached = callWrapperCache.get(call)
    if (cached !== undefined) {
      return cached ?? undefined
    }

    const wrapperName = directWrapperName(call) ?? curriedWrapperName(call)
    callWrapperCache.set(call, wrapperName ?? null)
    return wrapperName
  }

  const isInsideEffectWrapperArgument = (node: TSESTree.Node): EffectWrapperName | undefined => {
    if (!isGeneratorFunctionExpression(node)) {
      return undefined
    }

    const parent = node.parent
    if (parent?.type !== AST_NODE_TYPES.CallExpression) {
      return undefined
    }

    // `arguments` here is the CallExpression AST node's array property, not the
    // legacy function arguments object the rule is guarding.
    // eslint-disable-next-line baseline-js/use-baseline
    if (!parent.arguments.includes(node)) {
      return undefined
    }

    return getEffectWrapperName(parent)
  }

  return { getEffectWrapperName, isInsideEffectWrapperArgument, isTypeAware: true }
}
