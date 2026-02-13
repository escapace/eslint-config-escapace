import eslintPluginStylistic from '@stylistic/eslint-plugin'
import type { ESLint } from 'eslint'
import eslintPluginDeMorgan from 'eslint-plugin-de-morgan'
import eslintPluginDepend from 'eslint-plugin-depend'
import eslintPluginJSON from 'eslint-plugin-jsonc'
import eslintPluginRegexp from 'eslint-plugin-regexp'
import eslintPluginTOML from 'eslint-plugin-toml'
import eslintPluginTSDoc from 'eslint-plugin-tsdoc'
import eslintPluginYAML from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'

import eslintPluginPerfectionist from 'eslint-plugin-perfectionist'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { ensurePlugin } from './ensure-plugin'

export interface PluginsBase {
  'de-morgan': ESLint.Plugin
  'depend': ESLint.Plugin
  'json': ESLint.Plugin
  'perfectionist': ESLint.Plugin
  'regexp': ESLint.Plugin
  'stylistic': ESLint.Plugin
  'toml': ESLint.Plugin
  'tsdoc': ESLint.Plugin
  'typescript': ESLint.Plugin
  'unicorn': ESLint.Plugin
  'yaml': ESLint.Plugin
}

export interface PluginsVue {
  'vue': ESLint.Plugin
  'vue-a11y': ESLint.Plugin
}

export type PluginsAll = PluginsBase & PluginsVue

export const pluginsBase: PluginsBase = {
  'de-morgan': ensurePlugin(eslintPluginDeMorgan),
  'depend': ensurePlugin(eslintPluginDepend),
  'json': ensurePlugin(eslintPluginJSON),
  'perfectionist': ensurePlugin(eslintPluginPerfectionist),
  'regexp': ensurePlugin(eslintPluginRegexp.configs['flat/all'].plugins?.regexp),
  'stylistic': ensurePlugin(eslintPluginStylistic),
  'toml': ensurePlugin(eslintPluginTOML),
  'tsdoc': ensurePlugin(eslintPluginTSDoc),
  'typescript': ensurePlugin(tseslint.plugin),
  'unicorn': ensurePlugin(eslintPluginUnicorn),
  'yaml': ensurePlugin(eslintPluginYAML),
}

export const pluginsVue = async (): Promise<PluginsVue> => ({
  'vue': ensurePlugin(await import('eslint-plugin-vue')),
  'vue-a11y': ensurePlugin(await import('eslint-plugin-vuejs-accessibility')),
})

export const pluginsAll = async (): Promise<PluginsAll> => ({
  ...pluginsBase,
  ...(await pluginsVue()),
})
