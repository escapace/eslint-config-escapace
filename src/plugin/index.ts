import consistentFunctionScoping from './consistent-function-scoping'
import noEffectUntraced from './no-effect-untraced'
import noImportShadowsGlobal from './no-import-shadows-global'

// The plugin shape matches ESLint's runtime contract (`{ rules: Record<string, RuleModule> }`).
// Using a plain object literal here keeps the typescript-eslint `RuleCreator` output compatible
// with the looser ESLint flat-config plugin type without an explicit type assertion.
const plugin = {
  rules: {
    'consistent-function-scoping': consistentFunctionScoping,
    'no-effect-untraced': noEffectUntraced,
    'no-import-shadows-global': noImportShadowsGlobal,
  },
}

export default plugin
