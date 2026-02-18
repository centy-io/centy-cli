import { describe, expect, it } from 'vitest'
import { parseCustomFields } from './parse-custom-fields.js'

describe('parseCustomFields', () => {
  it('should return empty object for undefined', () => {
    expect(parseCustomFields(undefined)).toEqual({})
  })

  it('should return empty object for empty array', () => {
    expect(parseCustomFields([])).toEqual({})
  })

  it('should parse key=value pairs', () => {
    expect(parseCustomFields(['assignee=alice', 'team=backend'])).toEqual({
      assignee: 'alice',
      team: 'backend',
    })
  })

  it('should skip entries without =', () => {
    expect(parseCustomFields(['invalid', 'key=value'])).toEqual({
      key: 'value',
    })
  })

  it('should handle values containing =', () => {
    expect(parseCustomFields(['formula=a=b+c'])).toEqual({
      formula: 'a=b+c',
    })
  })
})
