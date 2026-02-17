import { describe, expect, it, vi } from 'vitest'
import { formatGenericItem } from './format-generic-item.js'

function createMockItem(
  overrides: Record<string, unknown> = {}
): Parameters<typeof formatGenericItem>[0] {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    itemType: 'issues',
    title: 'Test Issue',
    body: 'Test description',
    metadata: {
      displayNumber: 1,
      status: 'open',
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

describe('formatGenericItem', () => {
  it('should format an issue with display number', () => {
    const log = vi.fn()
    formatGenericItem(createMockItem(), log)

    expect(log).toHaveBeenCalledWith('Issue #1')
    expect(log).toHaveBeenCalledWith('ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    expect(log).toHaveBeenCalledWith('Title: Test Issue')
    expect(log).toHaveBeenCalledWith('Status: open')
    expect(log).toHaveBeenCalledWith('Priority: P1')
    expect(log).toHaveBeenCalledWith('Created: 2024-01-01T00:00:00Z')
    expect(log).toHaveBeenCalledWith('Updated: 2024-01-02T00:00:00Z')
    expect(log).toHaveBeenCalledWith('\nDescription:\nTest description')
  })

  it('should format a doc with Content label', () => {
    const log = vi.fn()
    formatGenericItem(
      createMockItem({
        itemType: 'docs',
        body: '# Welcome',
        metadata: {
          displayNumber: 0,
          status: '',
          priority: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          deletedAt: '',
          customFields: {},
        },
      }),
      log
    )

    expect(log).toHaveBeenCalledWith('\nContent:\n# Welcome')
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('Status:'))
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('Priority:'))
  })

  it('should handle item without metadata', () => {
    const log = vi.fn()
    formatGenericItem(createMockItem({ metadata: undefined }), log)

    expect(log).toHaveBeenCalledWith('Created: unknown')
    expect(log).toHaveBeenCalledWith('Updated: unknown')
  })

  it('should skip display number when zero', () => {
    const log = vi.fn()
    formatGenericItem(
      createMockItem({
        metadata: {
          displayNumber: 0,
          status: 'open',
          priority: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          deletedAt: '',
          customFields: {},
        },
      }),
      log
    )

    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('#'))
  })

  it('should skip status when empty', () => {
    const log = vi.fn()
    formatGenericItem(
      createMockItem({
        metadata: {
          displayNumber: 1,
          status: '',
          priority: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          deletedAt: '',
          customFields: {},
        },
      }),
      log
    )

    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('Status:'))
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('Priority:'))
  })

  it('should skip body when empty', () => {
    const log = vi.fn()
    formatGenericItem(createMockItem({ body: '' }), log)

    expect(log).not.toHaveBeenCalledWith(
      expect.stringContaining('Description:')
    )
  })

  it('should singularize item types ending in ies', () => {
    const log = vi.fn()
    formatGenericItem(createMockItem({ itemType: 'categories' }), log)

    expect(log).toHaveBeenCalledWith('Category #1')
  })

  it('should handle custom item types', () => {
    const log = vi.fn()
    formatGenericItem(createMockItem({ itemType: 'bugs' }), log)

    expect(log).toHaveBeenCalledWith('Bug #1')
  })
})
