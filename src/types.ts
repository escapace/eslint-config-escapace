/* eslint-disable typescript/no-explicit-any */
import type { Config as ConfigFile } from 'typescript-eslint'
import type { Rules } from './types/rules'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type RuleSeverity = 'error' | 'off' | 'warn'
export type RuleSeverityNumber = 0 | 1 | 2

export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

export type RuleOptions<A, B, C> = [
  ...(Equal<A, unknown> extends true ? unknown[] : A extends any[] ? A : [] | [A]),
  ...(Equal<B, unknown> extends true ? [] : B extends any[] ? B : [] | [B]),
  ...(Equal<C, unknown> extends true ? [] : C extends any[] ? C : [] | [C]),
]

export type RuleEntry<
  PrimaryOptions = unknown,
  SecondaryOptions = unknown,
  TeritaryOptions = unknown,
> = [RuleSeverity, ...RuleOptions<PrimaryOptions, SecondaryOptions, TeritaryOptions>] | RuleSeverity

export type RuleEntryAlphanumeric<
  PrimaryOptions = unknown,
  SecondaryOptions = unknown,
  TeritaryOptions = unknown,
> =
  | [
      RuleSeverity | RuleSeverityNumber,
      ...RuleOptions<PrimaryOptions, SecondaryOptions, TeritaryOptions>,
    ]
  | RuleSeverity
  | RuleSeverityNumber

export type { Rules }

export type Config = Prettify<
  {
    /**
     * An object containing the configured rules. When `files` or `ignores` are specified, these
     * rule configurations are only available to the matching files.
     */
    rules?: Rules
  } & Omit<Awaited<ConfigFile> extends Array<infer T> ? T : unknown, 'rules'>
>

export type ConfigArray = Config[]
