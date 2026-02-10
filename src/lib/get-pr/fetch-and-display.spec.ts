import { describe, expect, it } from 'vitest'
import { parseDisplayNumber } from './fetch-and-display.js'

describe('parseDisplayNumber', () => {
  it('should parse numeric strings as display numbers', () => {
    expect(parseDisplayNumber('42')).toEqual({
      isDisplayNumber: true,
      displayNumber: 42,
    })
  })

  it('should not parse UUIDs as display numbers', () => {
    expect(parseDisplayNumber('abc-123').isDisplayNumber).toBe(false)
  })
})
