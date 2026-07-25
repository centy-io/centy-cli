import { describe, expect, it, vi } from 'vitest'
import { handleGlobalDisplayNumberSearch } from './handle-global-display-number-search.js'

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    itemType: 'issues',
    title: 'Test Issue',
    body: '',
    metadata: {
      displayNumber: 42,
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

describe('handleGlobalDisplayNumberSearch', () => {
  it('should log "not found" when no items match', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalDisplayNumberSearch({ items: [], errors: [] }, 42, log, warn)

    expect(log).toHaveBeenCalledWith('No issues found with display number: #42')
  })

  it('should warn about errors when no items found but errors exist', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalDisplayNumberSearch(
      { items: [], errors: ['project-a: timeout'] },
      42,
      log,
      warn
    )

    expect(warn).toHaveBeenCalledWith('Some projects could not be searched:')
    expect(warn).toHaveBeenCalledWith('  - project-a: timeout')
  })

  it('should log summary and item details when items are found', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalDisplayNumberSearch(
      {
        items: [
          {
            item: makeItem(),
            projectPath: '/path/to/project-a',
            projectName: 'project-a',
            displayPath: '~/project-a',
          },
        ],
        errors: [],
      },
      42,
      log,
      warn
    )

    expect(log).toHaveBeenCalledWith('Found 1 issue(s) matching #42\n')
    expect(log).toHaveBeenCalledWith(
      '--- Project: project-a (/path/to/project-a) ---'
    )
    expect(log).toHaveBeenCalledWith('Title: Test Issue')
    expect(warn).not.toHaveBeenCalled()
  })

  it('should warn about errors even when items are found', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalDisplayNumberSearch(
      {
        items: [
          {
            item: makeItem(),
            projectPath: '/path/to/project-a',
            projectName: 'project-a',
            displayPath: '~/project-a',
          },
        ],
        errors: ['project-b: timeout'],
      },
      42,
      log,
      warn
    )

    expect(warn).toHaveBeenCalledWith('Some projects could not be searched:')
  })
})
