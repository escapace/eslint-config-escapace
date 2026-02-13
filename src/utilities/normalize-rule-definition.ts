import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema'
import type { Rule } from 'eslint'
import { compile } from 'json-schema-to-typescript'
import {
  isFunction,
  isObject,
  isPlainObject,
  map,
  mapKeys,
  mapValues,
  omit,
} from 'es-toolkit/compat'
import assert from 'node:assert'
import { clean } from 'trigram-utils'
import { toTypeName } from './to-type-name'

// eslint-disable-next-line typescript/no-explicit-any, typescript/no-unsafe-function-type
export type LooseRuleCreateFunction = (context: any) => Record<string, Function | undefined>

const mapValuesDeep = (
  object: object | null | undefined,
  function_: (key: unknown, value: unknown) => unknown,
  key?: unknown,
): unknown =>
  Array.isArray(object)
    ? map(object, (innerObject, index) => mapValuesDeep(innerObject as object, function_, index))
    : isPlainObject(object)
      ? mapValues(object, (value, key) => mapValuesDeep(value, function_, key))
      : isObject(object)
        ? object
        : function_(object, key)

const ordinalSeries = new Map<number, string>([
  [1, 'Primary'],
  [2, 'Secondary'],
  [3, 'Tertiary'],
])

const ordinalName = (index: number) => {
  const ordinal = ordinalSeries.get(index)
  assert(ordinal !== undefined)

  return ordinal
}

const normalizeRuleSchema = (input: Rule.RuleMetaData['schema']): JSONSchema4[] => {
  const raw = input ?? []
  const schemas = (Array.isArray(raw) ? raw : [raw]).filter(
    (value): value is JSONSchema4 => value !== false,
  )

  return schemas.map(
    (value) =>
      mapValuesDeep(
        omit(
          mapKeys(value, (_, key) =>
            key === 'definitions' ? '$defs' : key === '$definitions' ? '$defs' : key,
          ),
          ['id'],
        ),
        (value: unknown, key) =>
          key === '$ref' && typeof value === 'string'
            ? // eslint-disable-next-line regexp/no-unused-capturing-group
              value.replace(/(#\/definitions\/|#\/items\/\d+\/\$defs\/)/i, `#/$defs/`)
            : value,
      ) as JSONSchema4,
  )
}

export type LooseRuleMetaData = {
  deprecated?: boolean | object | undefined
  docs?: Pick<Exclude<Rule.RuleMetaData['docs'], undefined>, 'description' | 'url'> | undefined
} & Omit<Rule.RuleMetaData, 'deprecated' | 'docs'>

export type LooseRuleDefinition =
  | LooseRuleCreateFunction
  | {
      meta?: LooseRuleMetaData | undefined
      schema?: LooseRuleMetaData['schema']
    }
  | undefined

export interface RuleDefinition {
  meta: {
    deprecated: boolean
    description: string | undefined
    descriptionTypescript: string[]
    fixable: string | undefined
    schema: JSONSchema4[]
    type: string | undefined
    typescript: Array<{
      name: string
      value: string
    }>
    url: string | undefined
  }
}

export const normalizeRuleDefinition = async (
  key: string,
  value: LooseRuleDefinition,
): Promise<RuleDefinition> => {
  assert(!isFunction(value), `${key} LooseRuleCreateFunction not supported`)

  const schema = normalizeRuleSchema(value?.meta?.schema ?? value?.schema)
  const typescript: Array<{ name: string; value: string }> = []
  const description = value?.meta?.docs?.description
  const url = value?.meta?.docs?.url

  const descriptionTypescript =
    typeof description === 'string'
      ? typeof url === 'string'
        ? ['/**', ` * ${clean(description)}`, ` *`, ` * ${url}`, ' */']
        : ['/**', ` * ${clean(description)}`, ' */']
      : typeof url === 'string'
        ? ['/**', ` * ${url}`, ' */']
        : []

  for (const [ordinal, _schema] of schema.map((value, index) => [index + 1, value] as const)) {
    try {
      const name =
        schema.length > 1
          ? `Rule${toTypeName(key)}${ordinalName(ordinal)}Options`
          : `Rule${toTypeName(key)}Options`

      const lines = (
        await compile(_schema, name, {
          bannerComment: '',
          declareExternallyReferenced: true,
          format: false,
          strictIndexSignatures: true,
        })
      ).split(/\r?\n/)

      const index = lines.findLastIndex((line) =>
        new RegExp(`export (?:interface|type) ${name}`, 'i').test(line),
      )

      assert(index !== -1)

      lines.splice(index, 0, ...descriptionTypescript)

      typescript.push({ name, value: lines.join('\n') })
    } catch (error) {
      console.log(key, ordinal)
      console.log(JSON.stringify(schema, null, 2))

      throw error
    }
  }

  return {
    meta: {
      deprecated: value?.meta?.deprecated === true || isPlainObject(value?.meta?.deprecated),
      description,
      descriptionTypescript,
      fixable: value?.meta?.fixable,
      schema,
      type: value?.meta?.type,
      typescript,
      url,
    },
  }
}
