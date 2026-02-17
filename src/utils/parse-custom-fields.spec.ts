import { describe, expect, it } from 'vitest'
import { parseCustomFields } from './parse-custom-fields.js'

describe('parseCustomFields', () => {
  it('should return empty object for undefined input', () => {
    expect(parseCustomFields(undefined)).toEqual({})
  })

  it('should parse key=value pairs', () => {
    expect(parseCustomFields(['assignee=alice', 'team=backend'])).toEqual({
      assignee: 'alice',
      team: 'backend',
    })
  })

  it('should skip entries without equals sign', () => {
    expect(parseCustomFields(['invalid', 'key=value'])).toEqual({
      key: 'value',
    })
  })

  it('should handle values containing equals signs', () => {
    expect(parseCustomFields(['expr=a=b'])).toEqual({ expr: 'a=b' })
  })
})
