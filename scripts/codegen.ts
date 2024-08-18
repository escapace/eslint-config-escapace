import { kebabCase } from 'lodash-es'
import assert from 'node:assert'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { format, resolveConfig, resolveConfigFile } from 'prettier'
import { fs } from 'zx'
import {
  rulesJavascript,
  rulesJSON,
  rulesJSON5,
  rulesJSONC,
  rulesTOML,
  rulesTypescript,
  rulesVue,
  rulesYAML,
} from '../src/config'
import type { RuleDefinition } from '../src/utilities/normalize-rule-definition'
import { ruleDefinitions } from '../src/utilities/rule-definitions'

const prettierConfigFile = await resolveConfigFile(import.meta.dirname)
assert(typeof prettierConfigFile === 'string')
const prettierConfig = await resolveConfig(prettierConfigFile)
assert(prettierConfig !== null)

const pathDirectoryTypes = path.join(import.meta.dirname, '../src/types')
const pathDirectoryRules = path.join(import.meta.dirname, '../src/rules')

await fs.emptyDir(pathDirectoryTypes)
await fs.emptyDir(pathDirectoryRules)

const pairs = {
  javascript: {
    filename: 'rules-javascript.ts',
    identifier: 'rulesJavaScript',
    rules: rulesJavascript,
  },
  json: { filename: 'rules-json.ts', identifier: 'rulesJSON', rules: rulesJSON },
  json5: { filename: 'rules-json5.ts', identifier: 'rulesJSON5', rules: rulesJSON5 },
  jsonc: { filename: 'rules-jsonc.ts', identifier: 'rulesJSONC', rules: rulesJSONC },
  toml: { filename: 'rules-toml.ts', identifier: 'rulesTOML', rules: rulesTOML },
  typescript: {
    filename: 'rules-typescript.ts',
    identifier: 'rulesTypeScript',
    rules: rulesTypescript,
  },
  vue: { filename: 'rules-vue.ts', identifier: 'rulesVue', rules: rulesVue },
  yaml: { filename: 'rules-yaml.ts', identifier: 'rulesYAML', rules: rulesYAML },
} as const

const collator = new Intl.Collator('en')

const data = new Map<
  string,
  { imports: Array<{ filename: string; name: string }>; rule: RuleDefinition }
>()

for (const [key, rule] of await ruleDefinitions()) {
  data.set(key, { imports: [], rule })

  for (const { name, value } of rule.meta.typescript) {
    const filename = `${kebabCase(name)}.ts`

    // eslint-disable-next-line typescript/no-non-null-assertion
    data.get(key)!.imports.push({ filename, name })
    const filepath = path.join(pathDirectoryTypes, filename)

    await writeFile(
      filepath,
      await format(value, { ...prettierConfig, filepath, parser: 'typescript' }),
    )
  }
}

const rulesInterface = [
  `import type { RuleEntry, RuleSeverity } from '../types'`,
  '',
  ...Array.from(data.entries()).flatMap(([_, value]) =>
    value.imports.map(
      (value) => `import type { ${value.name} } from './${path.basename(value.filename, '.ts')}'`,
    ),
  ),
  '',
  'export interface Rules extends Partial<{ [key: string]: [RuleSeverity, ...unknown[]] | RuleSeverity}> {',
  ...Array.from(data.entries()).flatMap(([key, value]) => [
    ...value.rule.meta.descriptionTypescript,
    value.imports.length === 0
      ? `'${key}'?: RuleEntry`
      : `'${key}'?: RuleEntry<${value.imports.map((value) => value.name).join(', ')}>`,
  ]),
  '}',
  '',
  `export type { ${Array.from(data.entries())
    .flatMap(([_, value]) => value.imports.map((value) => value.name))
    .join(', ')} }`,
  '',
]

await writeFile(
  path.join(pathDirectoryTypes, 'rules.ts'),
  await format(rulesInterface.join('\n'), { ...prettierConfig, parser: 'typescript' }),
)

for (const [_, { filename, identifier, rules }] of Object.entries(pairs)) {
  const string = `import type { Rules } from '../types/rules'

export const ${identifier}: Pick<Rules, ${Object.keys(rules)
    .sort((a, b) => collator.compare(a, b))
    .map((value) => `'${value}'`)
    .join(' | ')}> = ${JSON.stringify(rules, null, 2)}
`
  await writeFile(
    path.join(pathDirectoryRules, filename),
    await format(string, { ...prettierConfig, parser: 'typescript' }),
  )
}
