import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonListItemsAcrossProjects = vi.fn()

vi.mock('./daemon-list-items-across-projects.js', () => ({
  daemonListItemsAcrossProjects: (...args: unknown[]) =>
    mockDaemonListItemsAcrossProjects(...args),
}))

describe('listItemsGlobally', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return items from all projects', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    const itemA = {
      id: 'item-a',
      title: 'Item A',
      metadata: {
        createdAt: '2024-01-02T00:00:00Z',
        displayNumber: 1,
        status: 'open',
        priority: 1,
      },
    }
    const itemB = {
      id: 'item-b',
      title: 'Item B',
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        displayNumber: 2,
        status: 'open',
        priority: 2,
      },
    }

    mockDaemonListItemsAcrossProjects.mockResolvedValue({
      success: true,
      items: [
        {
          item: itemA,
          projectPath: '/path/to/project-a',
          projectName: 'project-a',
          displayPath: '~/project-a',
        },
        {
          item: itemB,
          projectPath: '/path/to/project-b',
          projectName: 'project-b',
          displayPath: '~/project-b',
        },
      ],
      totalCount: 2,
      errors: [],
      error: '',
    })

    const result = await listItemsGlobally('issues', '', 0, 0)

    expect(result.items).toHaveLength(2)
    expect(result.items[0].item).toBe(itemA)
    expect(result.items[0].projectName).toBe('project-a')
    expect(result.items[1].item).toBe(itemB)
    expect(result.items[1].projectName).toBe('project-b')
    expect(result.errors).toHaveLength(0)
  })

  it('should forward errors from the RPC response', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListItemsAcrossProjects.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
      errors: ['/a: Connection refused'],
      error: '',
    })

    const result = await listItemsGlobally('issues', '', 0, 0)

    expect(result.items).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('/a')
  })

  it('should pass itemType, filter, limit, and offset to the RPC', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListItemsAcrossProjects.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
      errors: [],
      error: '',
    })

    const filter = JSON.stringify({ status: { $eq: 'open' } })
    await listItemsGlobally('issues', filter, 10, 5)

    expect(mockDaemonListItemsAcrossProjects).toHaveBeenCalledWith({
      itemType: 'issues',
      filter,
      limit: 10,
      offset: 5,
    })
  })
})
