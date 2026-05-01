/*! Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See ./LICENSE for license information.
 */

import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './rule'

describe('getErrorMessage', () => {
  it('returns Error messages', () => {
    expect(getErrorMessage(new Error('expected failure'))).toBe('expected failure')
  })

  it('formats non-Error thrown values', () => {
    expect(getErrorMessage('string failure')).toBe('string failure')
  })
})
