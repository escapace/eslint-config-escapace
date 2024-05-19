// @ts-check

import { compose, escapace } from 'eslint-config-escapace'

export default compose(escapace(), {
  ignores: ['src/types/*.ts', 'src/rules/*.ts'],
})
