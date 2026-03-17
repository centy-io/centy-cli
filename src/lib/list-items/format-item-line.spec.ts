import { describe, expect, it } from 'vitest'
import { formatItemLine } from './format-item-line.js'

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'uuid-1',
    itemType: 'issues',
    title: 'My issue',
    body: '',
    ...overrides,
  }
}

describe('formatItemLine', () => {
  it('should show display number when present', () => {
    const item = makeItem({
      metadata: {
        displayNumber: 3,
        status: 'open',
        priority: 0,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        customFields: {},
      },
    })
    expect(formatItemLine(item)).toBe('#3 My issue [open]')
  })

  it('should omit display number when zero', () => {
    const item = makeItem({
      metadata: {
        displayNumber: 0,
        status: 'open',
        priority: 0,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        customFields: {},
      },
    })
    expect(formatItemLine(item)).toBe('My issue [open]')
  })

  it('should show priority when non-zero', () => {
    const item = makeItem({
      metadata: {
        displayNumber: 0,
        status: '',
        priority: 2,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        customFields: {},
      },
    })
    expect(formatItemLine(item)).toBe('My issue P2')
  })

  it('should handle item with no metadata', () => {
    const item = makeItem()
    expect(formatItemLine(item)).toBe('My issue')
  })
})
