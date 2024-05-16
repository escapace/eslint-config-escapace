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

const collator = new Intl.Collator('en')

for (const [key, value] of Object.entries(pairs)) {
  await writeFile(
    path.join(import.meta.dirname, '../src/rules', `${key}.json`),
    await format(canonicalize(value), { ...prettierConfig, parser: 'json' }),
  )

  const asd = `import type { Rules } from '../types'

declare const data: Rules<${Object.keys(value)
    .sort((a, b) => collator.compare(a, b))
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
export type RulesIntersection = ${uniq(
      listRules()
        .map((value) => value[0])
        .sort((a, b) => collator.compare(a, b)),
    )
      .map((value) => `'${value}'`)
      .join(' | ')}`,
    { ...prettierConfig, parser: 'typescript' },
  ),
)

// type RuleMetaData = Rule.RuleMetaData

// import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema'
// import { compile } from 'json-schema-to-typescript'
//
// for (const [key, value] of listRules()) {
//   if (isFunction(value)) {
//     continue
//   }
//
//   const description = value?.meta?.docs?.description
//   const url = value?.meta?.docs?.url
//   const type = value?.meta?.type
//   const schema = value?.meta?.schema
//
//   if (Array.isArray(schema) && schema.length >= 2) {
//
//   const sc = Array.isArray(schema)
//     ? schema.length === 1
//       ? schema[0]
//       : schema.length === 0
//         ? undefined
//         : { prefixItems: schema, type: 'array' }
//     : schema
//
//   const scc = isEmpty(sc)
//     ? undefined
//     : (mapValuesDeep(
//       mapKeys(sc, (_, key) =>
//         key === 'definitions' ? '$defs' : key === '$definitions' ? '$defs' : key,
//       ) as JSONSchema4,
//       (value: unknown, key) => key === '$ref' && typeof value === 'string'
//         // eslint-disable-next-line regexp/no-unused-capturing-group
//         ? value.replace(/(#\/definitions\/|#\/items\/\d+\/\$defs\/)/i, `#/$defs/`)
//         : value,
//     ) as JSONSchema4)
//
//   if (!isEmpty(scc)) {
//     try {
//       console.log(key)
//
//       console.log(
//         await compile(scc, key, {
//           bannerComment: '',
//           declareExternallyReferenced: true,
//           format: false,
//           strictIndexSignatures: true,
//         }),
//       )
//       // console.log('----')
//     } catch (e) {
//       console.log(key)
//       console.log(JSON.stringify(scc, null, 2))
//
//       throw e
//     }
//   } else {
//     // console.log(sc, schema)
//   }
//   // console.log(value?.meta)
// }
//
// import { isEmpty, isFunction, isObject, isPlainObject, map, mapKeys, mapValues, pickBy } from 'lodash-es'
// const mapValuesDeep = (object: object | null | undefined, function_: (key: unknown, value: unknown) => unknown, key?: unknown): unknown =>
//   Array.isArray(object)
//     ? map(object, (innerObject, index) => mapValuesDeep(innerObject as object, function_, index))
//     : isPlainObject(object)
//       ? mapValues(object, (value, key) => mapValuesDeep(value, function_, key))
//       : isObject(object)
//         ? object
//         : function_(object, key)
//
