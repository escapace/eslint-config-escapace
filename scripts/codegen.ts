import { canonicalize } from '@escapace/canonicalize'
import assert from 'node:assert'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { format, resolveConfig, resolveConfigFile } from 'prettier'
import {
  listRules,
  rulesJavascript,
  rulesJSON,
  rulesJSON5,
  rulesJSONC,
  rulesTypescript,
  rulesVue,
  rulesYAML,
} from '../src/config'
import { uniq } from 'lodash-es'

const prettierConfigFile = await resolveConfigFile(import.meta.dirname)
assert(typeof prettierConfigFile === 'string')
const prettierConfig = await resolveConfig(prettierConfigFile)
assert(prettierConfig !== null)

const pairs = {
  javascript: rulesJavascript,
  json: rulesJSON,
  json5: rulesJSON5,
  jsonc: rulesJSONC,
  typescript: rulesTypescript,
  vue: rulesVue,
  yaml: rulesYAML,
} as const

for (const [key, value] of Object.entries(pairs)) {
  await writeFile(
    path.join(import.meta.dirname, '../src/rules', `${key}.json`),
    await format(canonicalize(value), { ...prettierConfig, parser: 'json' }),
  )

  const asd = `import type { Rules } from '../types'

declare const data: Rules<${Object.keys(value)
    .sort()
    .map((value) => `'${value}'`)
    .join(' | ')}>
export default data
`

  await writeFile(
    path.join(import.meta.dirname, '../src/rules', `${key}.d.json.ts`),
    await format(asd, { ...prettierConfig, parser: 'typescript' }),
  )
}

await writeFile(
  path.join(import.meta.dirname, '../src', `rules-intersection.ts`),
  await format(
    `
/**
 * @public
 */
export type RulesIntersection = ${uniq(listRules().sort())
      .map((value) => `'${value}'`)
      .join(' | ')}`,
    { ...prettierConfig, parser: 'typescript' },
  ),
)
