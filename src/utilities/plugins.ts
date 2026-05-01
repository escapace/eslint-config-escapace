import eslintPluginStylistic from '@stylistic/eslint-plugin'
import eslintPluginVitest from '@vitest/eslint-plugin'
import type { ESLint } from 'eslint'
import eslintPluginDeMorgan from 'eslint-plugin-de-morgan'
import eslintPluginDepend from 'eslint-plugin-depend'
import eslintPluginBaselineJs from 'eslint-plugin-baseline-js'
import eslintPluginJSON from 'eslint-plugin-jsonc'
import eslintPluginMath from 'eslint-plugin-math'
import eslintPluginRegexp from 'eslint-plugin-regexp'
import eslintPluginTOML from 'eslint-plugin-toml'
import eslintPluginTSDocument from '../vendor/tsdoc'
import eslintPluginYAML from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'

import eslintPluginPerfectionist from 'eslint-plugin-perfectionist'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { ensurePlugin } from './ensure-plugin'

export interface PluginsBase {
  'baseline-js': ESLint.Plugin
  'de-morgan': ESLint.Plugin
  'depend': ESLint.Plugin
  'json': ESLint.Plugin
  'math': ESLint.Plugin
  'perfectionist': ESLint.Plugin
  'regexp': ESLint.Plugin
  'stylistic': ESLint.Plugin
  'toml': ESLint.Plugin
  'tsdoc': ESLint.Plugin
  'typescript': ESLint.Plugin
  'unicorn': ESLint.Plugin
  'vitest': ESLint.Plugin
  'yaml': ESLint.Plugin
}

export interface PluginsVue {
  'vue': ESLint.Plugin
  'vue-a11y': ESLint.Plugin
}

export type PluginsAll = PluginsBase & PluginsVue

export const pluginsBase: PluginsBase = {
  'baseline-js': ensurePlugin(eslintPluginBaselineJs),
  'de-morgan': ensurePlugin(eslintPluginDeMorgan),
  'depend': ensurePlugin(eslintPluginDepend),
  'json': ensurePlugin(eslintPluginJSON),
  'math': ensurePlugin(eslintPluginMath),
  'perfectionist': ensurePlugin(eslintPluginPerfectionist),
  'regexp': ensurePlugin(eslintPluginRegexp.configs['flat/all'].plugins?.regexp),
  'stylistic': ensurePlugin(eslintPluginStylistic),
  'toml': ensurePlugin(eslintPluginTOML),
  'tsdoc': ensurePlugin(eslintPluginTSDocument),
  'typescript': ensurePlugin(tseslint.plugin),
  'unicorn': ensurePlugin(eslintPluginUnicorn),
  'vitest': ensurePlugin(eslintPluginVitest),
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
