import { describe, it, expect, vi } from 'vitest'
import { handleGlobalIssueSearch } from './handle-global-search.js'

describe('handleGlobalIssueSearch', () => {
  it('should log no items found when result is empty', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalIssueSearch(
      { items: [], errors: [], totalCount: 0 },
      'uuid-1',
      log,
      warn
    )

    expect(log).toHaveBeenCalledWith('No issues found with UUID: uuid-1')
  })

  it('should warn about search errors when no items found', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalIssueSearch(
      { items: [], errors: ['project-a failed'], totalCount: 0 },
      'uuid-1',
      log,
      warn
    )

    expect(warn).toHaveBeenCalledWith('Some projects could not be searched:')
  })

  it('should log item details when items are found', () => {
    const log = vi.fn()
    const warn = vi.fn()

    handleGlobalIssueSearch(
      {
        items: [
          {
            projectName: 'my-project',
            projectPath: '/path/to/project',
            item: {
              id: 'uuid-1',
              title: 'Test issue',
              body: '',
              metadata: {
                displayNumber: 42,
                status: 'open',
                priority: 1,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-15',
              },
            },
          },
        ],
        errors: [],
        totalCount: 1,
      },
      'uuid-1',
      log,
      warn
    )

    expect(log).toHaveBeenCalledWith(expect.stringContaining('1 issue(s)'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('my-project'))
  })
})
