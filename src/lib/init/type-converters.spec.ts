import { describe, expect, it } from 'vitest'
import {
  fileInfoToResetFormat,
  fileInfoToRestoreFormat,
} from './type-converters.js'

describe('fileInfoToRestoreFormat', () => {
  it('should convert FileInfo to FileToRestore format', () => {
    const result = fileInfoToRestoreFormat({ path: 'test.md', hash: 'abc123' })
    expect(result).toEqual({ path: 'test.md', wasInManifest: true })
  })
})

describe('fileInfoToResetFormat', () => {
  it('should convert FileInfo to FileToReset format', () => {
    const result = fileInfoToResetFormat({ path: 'test.md', hash: 'abc123' })
    expect(result).toEqual({
      path: 'test.md',
      currentHash: 'abc123',
      originalHash: '',
    })
  })
})
