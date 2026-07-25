import { describe, expect, it } from 'vitest'
import { formatItemJson } from './format-item-json.js'

describe('formatItemJson', () => {
  it('should include displayNumber when item has one', () => {
    const item = {
      id: 'abc-123',
      itemType: 'issues',
      title: 'Test Issue',
      body: '',
      metadata: {
        displayNumber: 42,
        status: 'open',
        priority: 1,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        customFields: {},
      },
    }

    const result = formatItemJson('issue', item)

    expect(result).toMatchObject({
      type: 'issue',
      id: 'abc-123',
      displayNumber: 42,
      title: 'Test Issue',
      status: 'open',
    })
  })

  it('should omit displayNumber when item has displayNumber 0', () => {
    const item = {
      id: 'doc-slug',
      itemType: 'docs',
      title: 'My Doc',
      body: '',
      metadata: {
        displayNumber: 0,
        status: '',
        priority: 0,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        customFields: {},
      },
    }

    const result = formatItemJson('doc', item)

    expect(result.displayNumber).toBeUndefined()
    expect(result.type).toBe('doc')
    expect(result.id).toBe('doc-slug')
  })

  it('should handle item with no metadata', () => {
    const item = {
      id: 'custom-id',
      itemType: 'epics',
      title: 'My Epic',
      body: '',
      metadata: undefined,
    }

    const result = formatItemJson('epic', item)

    expect(result.type).toBe('epic')
    expect(result.id).toBe('custom-id')
    expect(result.title).toBe('My Epic')
    expect(result.displayNumber).toBeUndefined()
    expect(result.status).toBeUndefined()
  })
})
