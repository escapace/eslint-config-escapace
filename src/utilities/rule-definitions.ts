// @ts-expect-error no-types
import eslintRules from '../../node_modules/eslint/lib/rules/index.js'
import { pluginsAll } from './plugins'
import {
  normalizeRuleDefinition,
  type LooseRuleDefinition,
  type RuleDefinition,
} from './normalize-rule-definition'

export const ruleDefinitions = async (): Promise<Array<[string, RuleDefinition]>> => {
  const collator = new Intl.Collator('en')
  const plugins = await pluginsAll()

  const pluginEntries: Array<[prefix: string, rules: Record<string, LooseRuleDefinition>]> = [
    ['', Object.fromEntries(eslintRules as Map<string, LooseRuleDefinition>)],
    ['de-morgan', plugins['de-morgan'].rules ?? {}],
    ['depend', plugins.depend.rules ?? {}],
    ['json', plugins.json.rules as Record<string, LooseRuleDefinition>],
    ['math', plugins.math.rules ?? {}],
    ['perfectionist', plugins.perfectionist.rules ?? {}],
    ['regexp', plugins.regexp.rules ?? {}],
    ['stylistic', plugins.stylistic.rules as Record<string, LooseRuleDefinition>],
    ['toml', plugins.toml.rules ?? {}],
    ['tsdoc', plugins.tsdoc.rules ?? {}],
    ['typescript', plugins.typescript.rules ?? {}],
    ['unicorn', plugins.unicorn.rules ?? {}],
    ['vitest', plugins.vitest.rules ?? {}],
    ['vue', plugins.vue.rules ?? {}],
    ['vue-a11y', plugins['vue-a11y'].rules as Record<string, LooseRuleDefinition>],
    ['yaml', plugins.yaml.rules ?? {}],
  ]

  const entries = pluginEntries.flatMap(([prefix, rules]) =>
    Object.entries(rules).map(
      ([key, value]) =>
        [prefix === '' ? key : `${prefix}/${key}`, value] satisfies [string, LooseRuleDefinition],
    ),
  )

  return (
    await Promise.all(
      entries.map(
        async ([key, value]): Promise<[string, RuleDefinition]> => [
          key,
          await normalizeRuleDefinition(key, value),
        ],
      ),
    )
  ).sort(([a], [b]) => collator.compare(a, b))
}
