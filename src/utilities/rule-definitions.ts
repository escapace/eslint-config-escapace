// @ts-expect-error no-types
import eslintRules from '../../node_modules/eslint/lib/rules/index.js'
import { pluginsAll } from './plugins'
import {
  normalizeRuleDefinition,
  type LooseRuleDefinition,
  type RuleDefinition,
} from './normalize-rule-definition'
import { ok } from './ok.js'

export const ruleDefinitions = async (): Promise<Array<[string, RuleDefinition]>> => {
  const collator = new Intl.Collator('en')
  const plugins = await pluginsAll()

  return (
    await Promise.all(
      (
        [
          ...Array.from((eslintRules as Map<string, LooseRuleDefinition>).entries()),
          ...Object.entries(plugins.json.rules).map(
            ([key, value]) => [`json/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(ok(plugins.perfectionist.rules)).map(
            ([key, value]) =>
              [`perfectionist/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(plugins.regexp.rules).map(
            ([key, value]) => [`regexp/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(ok(plugins.tsdoc.rules)).map(
            ([key, value]) => [`tsdoc/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(ok(plugins.unicorn.rules)).map(
            ([key, value]) => [`unicorn/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(ok(plugins.vue.rules)).map(
            ([key, value]) => [`vue/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(plugins.yaml.rules).map(
            ([key, value]) => [`yaml/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(plugins.stylistic.rules).map(
            ([key, value]) => [`stylistic/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(plugins.typescript.rules ?? {}).map(
            ([key, value]) => [`typescript/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
          ...Object.entries(plugins['vue-a11y'].rules).map(
            ([key, value]) => [`vue-a11y/${key}`, value] satisfies [string, LooseRuleDefinition],
          ),
        ] satisfies Array<[string, LooseRuleDefinition]>
      ).map(
        async ([key, value]): Promise<[string, RuleDefinition]> => [
          key,
          await normalizeRuleDefinition(key, value),
        ],
      ),
    )
  ).sort(([a], [b]) => collator.compare(a, b))
}

// console.log(JSON.stringify(await ruleDefinitions(), null, 2))
