import type { Linter } from 'eslint'
import { ensureDefined } from './ensure-defined'

export const ensurePreset = (config: object | undefined, key: string): Linter.Config[] => {
  const value = ensureDefined(
    Reflect.get(ensureDefined(config), key) as Linter.Config | Linter.Config[] | undefined,
  )

  return Array.isArray(value) ? value : [value]
}
