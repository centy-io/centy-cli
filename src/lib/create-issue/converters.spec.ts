import { describe, expect, it } from 'vitest'
import {
  buildIssuePaths,
  convertCustomFields,
  convertPriority,
  handleDaemonError,
} from './converters.js'

describe('buildIssuePaths', () => {
  it('should build correct paths for an issue', () => {
    const result = buildIssuePaths('/project', '1')
    expect(result.issueFolderPath).toContain('1')
    expect(result.issueMdPath).toContain('issue.md')
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
