import { canonicalize } from '@escapace/canonicalize'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { rulesJavascript, rulesTypescript, rulesVue, rulesJSON, rulesYAML } from './config'

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

await writeFile(path.join(import.meta.dirname, 'rules', 'yaml.json'), canonicalize(rulesYAML))
