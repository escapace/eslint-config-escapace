/* eslint-disable typescript/no-unsafe-member-access */
import eslintPluginStylistic from '@stylistic/eslint-plugin'
import type { TSESLint } from '@typescript-eslint/utils'
import eslintPluginJSON from 'eslint-plugin-jsonc'
import eslintPluginRegexp from 'eslint-plugin-regexp'
import eslintPluginTOML from 'eslint-plugin-toml'
import eslintPluginTSDoc from 'eslint-plugin-tsdoc'
import eslintPluginYAML from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'

import eslintConfigPerfectionist from 'eslint-plugin-perfectionist'

import eslintPluginUnicorn from 'eslint-plugin-unicorn'

type Awaitable<T> = Promise<T> | T

// https://github.com/antfu/eslint-config/blob/main/src/utils.ts
export async function interopDefault<T>(
  m: Awaitable<T>,
): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m

  // eslint-disable-next-line typescript/no-unsafe-return, typescript/no-explicit-any
  return (resolved as any).default ?? resolved
}

export const pluginsDefault = {
  json: eslintPluginJSON,
  perfectionist: eslintConfigPerfectionist,
  regexp: eslintPluginRegexp.configs['flat/all'].plugins.regexp,
  stylistic: eslintPluginStylistic,
  toml: eslintPluginTOML,
  tsdoc: eslintPluginTSDoc as TSESLint.FlatConfig.Plugin,
  typescript: tseslint.plugin,
  unicorn: eslintPluginUnicorn,
  yaml: eslintPluginYAML,
} as const

const resolvePlugins = async <T extends Record<string, () => Promise<unknown>>>(plugins: T) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(
        plugins as unknown as Record<string, () => Promise<TSESLint.FlatConfig.Plugin>>,
      ).map(async ([key, value]) => [key, await value()] as const),
    ),
  ) as { [P in keyof T]: Awaited<ReturnType<T[P]>> }

export const pluginsVue = async () =>
  await resolvePlugins({
    'vue': async () =>
      // @ts-expect-error no-types
      await interopDefault<TSESLint.FlatConfig.Plugin>(import('eslint-plugin-vue')),
    'vue-a11y': async () => await interopDefault(import('eslint-plugin-vuejs-accessibility')),
  } as const)

export const pluginsAll = async () => ({ ...pluginsDefault, ...(await pluginsVue()) })
