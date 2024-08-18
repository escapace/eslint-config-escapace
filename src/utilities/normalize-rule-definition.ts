import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema'
import type { LooseRuleCreateFunction } from '@typescript-eslint/utils/ts-eslint'
import type { Rule } from 'eslint'
import { compile } from 'json-schema-to-typescript'
import { isFunction, isObject, isPlainObject, map, mapKeys, mapValues, omit } from 'lodash-es'
import assert from 'node:assert'
import { clean } from 'trigram-utils'
import type { Prettify } from '../types'
import { toSafeString } from './to-safe-string'

const mapValuesDeep = (
  object: null | object | undefined,
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
  [3, 'Teritary'],
])

const ordinalName = (index: number) => {
  const ordinal = ordinalSeries.get(index)
  assert(ordinal !== undefined)

  return ordinal
}

const normalizeRuleSchema = (input: Rule.RuleMetaData['schema']): JSONSchema4[] => {
  const _input = input ?? []
  const schemas = (Array.isArray(_input) ? _input : [_input]).filter(
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
  docs?: Pick<Exclude<Rule.RuleMetaData['docs'], undefined>, 'description' | 'url'> | undefined
} & Omit<Rule.RuleMetaData, 'docs'>

export type LooseRuleDefinition =
  | {
      meta?: LooseRuleMetaData | undefined
      schema?: LooseRuleMetaData['schema']
    }
  | LooseRuleCreateFunction
  | undefined

export const normalizeRuleDefinition = async (key: string, value: LooseRuleDefinition) => {
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
          ? `Rule${toSafeString(key)}${ordinalName(ordinal)}Options`
          : `Rule${toSafeString(key)}Options`

      const value = (
        await compile(_schema, name, {
          bannerComment: '',
          declareExternallyReferenced: true,
          format: false,
          strictIndexSignatures: true,
        })
      ).split(/\r?\n/)

      const index = value.findLastIndex((value) =>
        new RegExp(`export (?:interface|type) ${name}`, 'i').test(value),
      )

      assert(index !== -1)

      value.splice(index, 0, ...descriptionTypescript)

      typescript.push({ name, value: value.join('\n') })
    } catch (error) {
      console.log(key, ordinal)
      console.log(JSON.stringify(schema, null, 2))

      throw error
    }
  }

  return {
    meta: {
      deprecated: value?.meta?.deprecated === true,
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

export type RuleDefinition = Prettify<Awaited<ReturnType<typeof normalizeRuleDefinition>>>
// export type RuleMetaData = RuleDefinition['meta']
