import { describe, expect, it } from 'vitest'
import { parseDisplayNumber } from './parse-display-number.js'

describe('parseDisplayNumber', () => {
  it('should return a number for a numeric string', () => {
    expect(parseDisplayNumber('1')).toBe(1)
    expect(parseDisplayNumber('42')).toBe(42)
    expect(parseDisplayNumber('99')).toBe(99)
  })

  it('should return undefined for a UUID string', () => {
    expect(parseDisplayNumber('some-uuid')).toBeUndefined()
    expect(
      parseDisplayNumber('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    ).toBeUndefined()
  })

  it('should return undefined for a slug string', () => {
    expect(parseDisplayNumber('getting-started')).toBeUndefined()
    expect(parseDisplayNumber('john-doe')).toBeUndefined()
  })
})
