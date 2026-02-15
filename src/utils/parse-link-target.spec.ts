import { describe, expect, it } from 'vitest'
import { parseLinkTarget } from './parse-link-target.js'

describe('parseLinkTarget', () => {
  it('should parse a valid target', () => {
    expect(parseLinkTarget('issue:2')).toEqual(['issue', '2'])
  })

  it('should parse a target with a slug id', () => {
    expect(parseLinkTarget('doc:getting-started')).toEqual([
      'doc',
      'getting-started',
    ])
  })

  it('should return undefined for missing colon', () => {
    expect(parseLinkTarget('invalid')).toBeUndefined()
  })

  it('should return undefined for empty type', () => {
    expect(parseLinkTarget(':2')).toBeUndefined()
  })

  it('should return undefined for empty id', () => {
    expect(parseLinkTarget('issue:')).toBeUndefined()
  })

  it('should handle colons in the id', () => {
    expect(parseLinkTarget('issue:uuid:with:colons')).toEqual([
      'issue',
      'uuid:with:colons',
    ])
  })
})
