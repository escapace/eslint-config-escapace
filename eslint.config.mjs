// @ts-check

import { globalIgnores } from 'eslint/config'
import { compose, escapace } from 'eslint-config-escapace'

export default compose(
  escapace(),
  // In flat config, a bare ignore-only entry is global only while it stays an
  // ignore-only config. Use the helper so this stays global even if this file
  // grows later, and to give this global ignore config an explicit debug name.
  globalIgnores(['src/types/*.ts', 'src/rules/*.ts'], 'local generated sources'),
)
