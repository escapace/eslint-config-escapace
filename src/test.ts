import { isEmpty, isEqual, pickBy } from 'lodash-es'
import {
  listRules,
  rulesJSON5Defaults,
  rulesJSONCDefaults,
  rulesJSONDefaults,
  rulesJSONIncluded,
  rulesTypescriptDefaults,
  rulesTypescriptIncluded,
  rulesVueDefaults,
  rulesVueIncluded,
  rulesYAMLDefaults,
  rulesYAMLIncluded,
} from './config'
import type { RuleEntry } from './types'

// import path from 'node:path'
// import { fileURLToPath } from 'url'
// import { FlatCompat } from '@eslint/eslintrc'
// const baseDirectory = path.dirname(fileURLToPath(import.meta.url))
// const compat = new FlatCompat({
//   baseDirectory,
//   resolvePluginsRelativeTo: baseDirectory
//   // recommendedConfig: js.configs.recommended
// })

const rulesAll = listRules()

const checks = (rules: Record<string, RuleEntry>, defaults: Record<string, RuleEntry>) => {
  // check if rule exists
  const absent = pickBy(rules, (_, key) => !rulesAll.includes(key))

  if (!isEmpty(absent)) {
    throw new Error(`The following rules do not exist: ${JSON.stringify(absent, null, 2)}`)
  }

  // check if rule is default
  const duplicates = pickBy(rules, (value, key) => isEqual(defaults[key], value))

  if (!isEmpty(duplicates)) {
    throw new Error(
      `The following rules are already set to their defaults: ${JSON.stringify(duplicates, null, 2)}`,
    )
  }
}

checks(rulesTypescriptIncluded, rulesTypescriptDefaults)
checks(rulesYAMLIncluded, rulesYAMLDefaults)
checks(rulesJSONIncluded, rulesJSONDefaults)
checks(rulesJSONIncluded, rulesJSON5Defaults)
checks(rulesJSONIncluded, rulesJSONCDefaults)
checks(rulesVueIncluded, rulesVueDefaults)
