import { canonicalize } from '@escapace/canonicalize'
import assert from 'node:assert'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { format, resolveConfig, resolveConfigFile } from 'prettier'
import {
  rulesJavascript,
  rulesJSON,
  rulesJSON5,
  rulesJSONC,
  rulesTypescript,
  rulesVue,
  rulesYAML,
} from '../src/config'

const prettierConfigFile = await resolveConfigFile(import.meta.dirname)
assert(typeof prettierConfigFile === 'string')
const prettierConfig = await resolveConfig(prettierConfigFile)
assert(prettierConfig !== null)

const pairs = {
  'javascript.json': rulesJavascript,
  'json.json': rulesJSON,
  'json5.json': rulesJSON5,
  'jsonc.json': rulesJSONC,
  'typescript.json': rulesTypescript,
  'vue.json': rulesVue,
  'yaml.json': rulesYAML,
} as const

for (const [key, value] of Object.entries(pairs)) {
  await writeFile(
    path.join(import.meta.dirname, '../src/rules', key),
    await format(canonicalize(value), { ...prettierConfig, parser: 'json' }),
  )
}
