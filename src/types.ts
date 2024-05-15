import type { Config as ConfigFile } from 'typescript-eslint'
import type { RulesIntersection } from './rules-intersection'

/**
 * @public
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * @public
 */
export type RuleEntry = 'error' | 'off' | 'warn' | ['error' | 'off' | 'warn', ...unknown[]]

/**
 * @public
 */
export type RuleEntryAlphanumeric =
  | 'error'
  | 'off'
  | 'warn'
  | ['error' | 'off' | 'warn' | 0 | 1 | 2, ...unknown[]]
  | 0
  | 1
  | 2

/**
 * @public
 */
export type Rules<T extends string = string> = Partial<Record<T, RuleEntry>>

/**
 * @public
 */
export type Config = Prettify<
  {
    /**
     * An object containing the configured rules.
     * When `files` or `ignores` are specified, these rule configurations are only available to the matching files.
     */
    rules?: Rules<RulesIntersection>
  } & Omit<Awaited<ConfigFile> extends Array<infer T> ? T : unknown, 'rules'>
>

export type ConfigArray = Config[]
