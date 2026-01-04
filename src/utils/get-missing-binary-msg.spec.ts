import { describe, expect, it } from 'vitest'
import { getMissingBinaryMsg } from './get-missing-binary-msg.js'

describe('getMissingBinaryMsg', () => {
  it('should include path, binary name, and env var in message', () => {
    const result = getMissingBinaryMsg(
      '/path/to/binary',
      'my-binary',
      'MY_BINARY_PATH'
    )

    expect(result).toContain('my-binary not found at: /path/to/binary')
    expect(result).toContain('my-binary binary could not be located')
    expect(result).toContain('Set MY_BINARY_PATH')
  })
})
