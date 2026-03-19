import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockListItemsGlobally = vi.fn()

vi.mock('../../daemon/daemon-list-items-globally.js', () => ({
  listItemsGlobally: (...args: unknown[]) => mockListItemsGlobally(...args),
}))

function createMockItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'uuid-123',
    title: 'Test issue',
    metadata: {
      displayNumber: 1,
      status: 'open',
      priority: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

function createMockCmd() {
  const logs: string[] = []
  return { log: (msg: string) => logs.push(msg), logs }
}

describe('buildFilter', () => {
  it('should return empty string with no filters', async () => {
    const { buildFilter } = await import('./run-global-list.js')
    expect(buildFilter(undefined, undefined)).toBe('')
  })

  it('should include status when provided', async () => {
    const { buildFilter } = await import('./run-global-list.js')
    expect(buildFilter('open', undefined)).toBe(
      JSON.stringify({ status: 'open' })
    )
  })

  it('should include priority when provided', async () => {
    const { buildFilter } = await import('./run-global-list.js')
    expect(buildFilter(undefined, 1)).toBe(JSON.stringify({ priority: 1 }))
  })

  it('should include both status and priority when both provided', async () => {
    const { buildFilter } = await import('./run-global-list.js')
    expect(buildFilter('open', 2)).toBe(
      JSON.stringify({ status: 'open', priority: 2 })
    )
  })
})

describe('runGlobalList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call listItemsGlobally with correct args', async () => {
    const { runGlobalList } = await import('./run-global-list.js')
    mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })
    const cmd = createMockCmd()
    await runGlobalList(cmd, 'issues', '', 10, 5, false)
    expect(mockListItemsGlobally).toHaveBeenCalledWith('issues', '', 10, 5)
  })

  it('should display items with project name prefix', async () => {
    const { runGlobalList } = await import('./run-global-list.js')
    const item = createMockItem()
    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item,
          projectName: 'my-project',
          projectPath: '/path/to/my-project',
          displayPath: '~/my-project',
        },
      ],
      errors: [],
    })
    const cmd = createMockCmd()
    await runGlobalList(cmd, 'issues', '', 0, 0, false)
    expect(
      cmd.logs.some(l => l.includes('[my-project]') && l.includes('Test issue'))
    ).toBe(true)
  })

  it('should output JSON with projectName and projectPath when json=true', async () => {
    const { runGlobalList } = await import('./run-global-list.js')
    const item = createMockItem()
    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item,
          projectName: 'my-project',
          projectPath: '/path/to/my-project',
          displayPath: '~/my-project',
        },
      ],
      errors: [],
    })
    const cmd = createMockCmd()
    await runGlobalList(cmd, 'issues', '', 0, 0, true)
    const parsed = JSON.parse(cmd.logs[0])
    expect(parsed[0].projectName).toBe('my-project')
    expect(parsed[0].projectPath).toBe('/path/to/my-project')
    expect(parsed[0].id).toBe('uuid-123')
  })

  it('should show no items message when empty', async () => {
    const { runGlobalList } = await import('./run-global-list.js')
    mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })
    const cmd = createMockCmd()
    await runGlobalList(cmd, 'issues', '', 0, 0, false)
    expect(cmd.logs[0]).toContain('No issues found.')
  })
})
