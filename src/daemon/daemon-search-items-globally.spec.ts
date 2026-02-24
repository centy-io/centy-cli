import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonListProjects = vi.fn()
const mockDaemonGetItem = vi.fn()

vi.mock('./daemon-list-projects.js', () => ({
  daemonListProjects: (...args: unknown[]) => mockDaemonListProjects(...args),
}))

vi.mock('./daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

describe('searchItemsByDisplayNumberGlobally', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return items found across initialized projects', async () => {
    const { searchItemsByDisplayNumberGlobally } = await import(
      './daemon-search-items-globally.js'
    )

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        {
          path: '/path/to/project-a',
          name: 'project-a',
          displayPath: '~/project-a',
          initialized: true,
        },
        {
          path: '/path/to/project-b',
          name: 'project-b',
          displayPath: '~/project-b',
          initialized: true,
        },
      ],
    })

    const mockItem = {
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
    }

    mockDaemonGetItem
      .mockResolvedValueOnce({ success: true, item: mockItem })
      .mockResolvedValueOnce({ success: false, error: 'Not found' })

    const result = await searchItemsByDisplayNumberGlobally('issues', 42)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].projectName).toBe('project-a')
    expect(result.items[0].item).toBe(mockItem)
    expect(result.errors).toHaveLength(0)
  })

  it('should skip uninitialized projects', async () => {
    const { searchItemsByDisplayNumberGlobally } = await import(
      './daemon-search-items-globally.js'
    )

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        {
          path: '/path/to/project-a',
          name: 'project-a',
          displayPath: '~/project-a',
          initialized: false,
        },
      ],
    })

    const result = await searchItemsByDisplayNumberGlobally('issues', 1)

    expect(mockDaemonGetItem).not.toHaveBeenCalled()
    expect(result.items).toHaveLength(0)
  })

  it('should collect errors from failed project lookups', async () => {
    const { searchItemsByDisplayNumberGlobally } = await import(
      './daemon-search-items-globally.js'
    )

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        {
          path: '/path/to/project-a',
          name: 'project-a',
          displayPath: '~/project-a',
          initialized: true,
        },
      ],
    })

    mockDaemonGetItem.mockRejectedValue(new Error('Connection refused'))

    const result = await searchItemsByDisplayNumberGlobally('issues', 1)

    expect(result.items).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('project-a')
  })

  it('should return empty result when no projects are registered', async () => {
    const { searchItemsByDisplayNumberGlobally } = await import(
      './daemon-search-items-globally.js'
    )

    mockDaemonListProjects.mockResolvedValue({ projects: [] })

    const result = await searchItemsByDisplayNumberGlobally('issues', 1)

    expect(result.items).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })
})
