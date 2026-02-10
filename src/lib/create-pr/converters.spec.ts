import { describe, expect, it } from 'vitest'
import {
  buildPrPaths,
  convertCustomFields,
  convertPriority,
  handleDaemonError,
} from './converters.js'

describe('buildPrPaths', () => {
  it('should build correct paths for a PR', () => {
    const result = buildPrPaths('/project', 'pr-1')
    expect(result.prFolderPath).toContain('pr-1')
    expect(result.prMdPath).toContain('pr.md')
    expect(result.metadataPath).toContain('metadata.json')
  })
})

describe('handleDaemonError', () => {
  it('should return daemon error for ECONNREFUSED', () => {
    const result = handleDaemonError(new Error('ECONNREFUSED'))
    expect(result.success).toBe(false)
    expect(result.error).toContain('daemon')
  })

  it('should return generic error for other errors', () => {
    const result = handleDaemonError(new Error('something else'))
    expect(result.success).toBe(false)
    expect(result.error).toBe('something else')
  })
})

describe('convertCustomFields', () => {
  it('should return empty object for undefined', () => {
    expect(convertCustomFields(undefined)).toEqual({})
  })

  it('should convert values to strings', () => {
    const result = convertCustomFields({ key: 123 })
    expect(result).toEqual({ key: '123' })
  })
})

describe('convertPriority', () => {
  it('should convert high to 1', () => {
    expect(convertPriority('high')).toBe(1)
  })

  it('should convert medium to 2', () => {
    expect(convertPriority('medium')).toBe(2)
  })

  it('should convert low to 3', () => {
    expect(convertPriority('low')).toBe(3)
  })

  it('should return 0 for undefined', () => {
    expect(convertPriority(undefined)).toBe(0)
  })
})
