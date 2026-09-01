import type { ESLint } from 'eslint'
import { isPlainObject } from 'es-toolkit/compat'

const presetReplacements = {
  app: { application: true },
  application: false,
  applications: false,
  apps: { applications: true },
  configuration: false,
  repo: { repository: true },
  repository: false,
} as const

interface NameReplacementsOptions {
  extendDefaultReplacements?: boolean
  replacements?: Record<string, boolean | Record<string, boolean>>
}

const withOptions = <Context extends { readonly options: readonly unknown[] }>(
  context: Context,
  options: NameReplacementsOptions,
): Context =>
  Object.create(context, {
    options: {
      enumerable: true,
      value: [options, ...context.options.slice(1)],
    },
  }) as Context

/**
 * Makes this preset's replacements behave like Unicorn defaults. Later ESLint configurations can
 * extend them normally, while `extendDefaultReplacements: false` still replaces them completely.
 */
export const withPresetNameReplacements = (plugin: ESLint.Plugin): ESLint.Plugin => {
  const rule = plugin.rules?.['name-replacements']

  if (rule === undefined) {
    throw new Error('eslint-plugin-unicorn does not provide the name-replacements rule')
  }

  return {
    ...plugin,
    rules: {
      ...plugin.rules,
      'name-replacements': {
        ...rule,
        create(context) {
          const rawOptions = context.options[0]

          if (rawOptions !== undefined && !isPlainObject(rawOptions)) {
            return rule.create(context)
          }

          const options = (rawOptions ?? {}) as NameReplacementsOptions

          if (options.extendDefaultReplacements === false) {
            return rule.create(context)
          }

          const replacements = options.replacements

          if (replacements !== undefined && !isPlainObject(replacements)) {
            return rule.create(context)
          }

          return rule.create(
            withOptions(context, {
              ...options,
              replacements: {
                ...presetReplacements,
                ...replacements,
              },
            }),
          )
        },
      },
    },
  }
}
