import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonListProjects = vi.fn()
const mockDaemonListItems = vi.fn()

vi.mock('./daemon-list-projects.js', () => ({
  daemonListProjects: (...args: unknown[]) => mockDaemonListProjects(...args),
}))

vi.mock('./daemon-list-items.js', () => ({
  daemonListItems: (...args: unknown[]) => mockDaemonListItems(...args),
}))

describe('listItemsGlobally', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return items from all initialized projects', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

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

    mockDaemonListItems
      .mockResolvedValueOnce({ success: true, items: [itemA] })
      .mockResolvedValueOnce({ success: true, items: [itemB] })

    const result = await listItemsGlobally('issues', '', 0, 0)

    expect(result.items).toHaveLength(2)
    expect(result.items[0].item).toBe(itemA)
    expect(result.items[0].projectName).toBe('project-a')
    expect(result.items[1].item).toBe(itemB)
    expect(result.items[1].projectName).toBe('project-b')
    expect(result.errors).toHaveLength(0)
  })

  it('should sort results by createdAt descending', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/a', name: 'a', displayPath: '~/a', initialized: true },
        { path: '/b', name: 'b', displayPath: '~/b', initialized: true },
      ],
    })

    const older = {
      id: 'older',
      title: 'Older',
      metadata: { createdAt: '2024-01-01T00:00:00Z' },
    }
    const newer = {
      id: 'newer',
      title: 'Newer',
      metadata: { createdAt: '2024-06-01T00:00:00Z' },
    }

    mockDaemonListItems
      .mockResolvedValueOnce({ success: true, items: [older] })
      .mockResolvedValueOnce({ success: true, items: [newer] })

    const result = await listItemsGlobally('issues', '', 0, 0)

    expect(result.items[0].item.title).toBe('Newer')
    expect(result.items[1].item.title).toBe('Older')
  })

  it('should skip uninitialized projects', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/a', name: 'a', displayPath: '~/a', initialized: false },
      ],
    })

    const result = await listItemsGlobally('issues', '', 0, 0)

    expect(mockDaemonListItems).not.toHaveBeenCalled()
    expect(result.items).toHaveLength(0)
  })

  it('should collect errors from failed projects', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/a', name: 'a', displayPath: '~/a', initialized: true },
      ],
    })

    mockDaemonListItems.mockRejectedValue(new Error('Connection refused'))

    const result = await listItemsGlobally('issues', '', 0, 0)

    expect(result.items).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('/a')
  })

  it('should apply limit and offset to aggregated results', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/a', name: 'a', displayPath: '~/a', initialized: true },
      ],
    })

    const items = Array.from({ length: 5 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
      metadata: { createdAt: `2024-01-0${5 - i}T00:00:00Z` },
    }))

    mockDaemonListItems.mockResolvedValue({ success: true, items })

    const result = await listItemsGlobally('issues', '', 2, 1)

    expect(result.items).toHaveLength(2)
    expect(result.items[0].item.title).toBe('Item 1')
    expect(result.items[1].item.title).toBe('Item 2')
  })

  it('should pass filter to each project call', async () => {
    const { listItemsGlobally } =
      await import('./daemon-list-items-globally.js')

    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/a', name: 'a', displayPath: '~/a', initialized: true },
      ],
    })

    mockDaemonListItems.mockResolvedValue({ success: true, items: [] })

    const filter = JSON.stringify({ status: { $eq: 'open' } })
    await listItemsGlobally('issues', filter, 0, 0)

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({ filter })
    )
  })
})
