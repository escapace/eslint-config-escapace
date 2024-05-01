import { canonicalize } from '@escapace/canonicalize'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  rulesJavascript,
  rulesTypescript,
  rulesVue,
  rulesJSON,
  rulesYAML,
  rulesJSON5,
  rulesJSONC,
} from './config'

await writeFile(
  path.join(import.meta.dirname, 'rules', 'javascript.json'),
  canonicalize(rulesJavascript),
)

await writeFile(
  path.join(import.meta.dirname, 'rules', 'typescript.json'),
  canonicalize(rulesTypescript),
)

await writeFile(path.join(import.meta.dirname, 'rules', 'vue.json'), canonicalize(rulesVue))
await writeFile(path.join(import.meta.dirname, 'rules', 'json.json'), canonicalize(rulesJSON))
await writeFile(path.join(import.meta.dirname, 'rules', 'json5.json'), canonicalize(rulesJSON5))
await writeFile(path.join(import.meta.dirname, 'rules', 'jsonc.json'), canonicalize(rulesJSONC))
await writeFile(path.join(import.meta.dirname, 'rules', 'yaml.json'), canonicalize(rulesYAML))
