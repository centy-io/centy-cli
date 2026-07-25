import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockListItemsGlobally = vi.fn()

vi.mock('../../daemon/daemon-list-items-globally.js', () => ({
  listItemsGlobally: (...args: unknown[]) => mockListItemsGlobally(...args),
}))

describe('handleGlobalList', () => {
  let log: ReturnType<typeof vi.fn>
  let warn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    log = vi.fn()
    warn = vi.fn()
  })

  it('should display items with project prefix', async () => {
    const { handleGlobalList } = await import('./handle-global-list.js')

    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item: {
            id: 'item-1',
            title: 'Test Issue',
            metadata: { displayNumber: 42, status: 'open', priority: 2 },
          },
          projectName: 'my-project',
          projectPath: '/path/to/my-project',
          displayPath: '~/my-project',
        },
      ],
      errors: [],
    })

    await handleGlobalList('issues', '', 0, 0, false, log, warn)

    expect(log).toHaveBeenCalledWith(expect.stringContaining('[my-project]'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('#42'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Test Issue'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[open]'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[P2]'))
  })

  it('should output JSON with projectName and projectPath', async () => {
    const { handleGlobalList } = await import('./handle-global-list.js')

    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item: {
            id: 'item-1',
            title: 'Test Issue',
            metadata: { displayNumber: 1, status: 'open', priority: 1 },
          },
          projectName: 'my-project',
          projectPath: '/path/to/my-project',
          displayPath: '~/my-project',
        },
      ],
      errors: [],
    })

    await handleGlobalList('issues', '', 0, 0, true, log, warn)

    const output = JSON.parse(log.mock.calls[0][0])
    expect(Array.isArray(output)).toBe(true)
    expect(output[0].projectName).toBe('my-project')
    expect(output[0].projectPath).toBe('/path/to/my-project')
    expect(output[0].title).toBe('Test Issue')
  })

  it('should show message when no items found', async () => {
    const { handleGlobalList } = await import('./handle-global-list.js')

    mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })

    await handleGlobalList('issues', '', 0, 0, false, log, warn)

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('No issues found across projects')
    )
  })

  it('should warn about project errors', async () => {
    const { handleGlobalList } = await import('./handle-global-list.js')

    mockListItemsGlobally.mockResolvedValue({
      items: [],
      errors: ['/path/to/broken: Connection refused'],
    })

    await handleGlobalList('issues', '', 0, 0, false, log, warn)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Some projects could not be searched')
    )
  })

  it('should handle items without metadata', async () => {
    const { handleGlobalList } = await import('./handle-global-list.js')

    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item: { id: 'item-1', title: 'No meta', metadata: undefined },
          projectName: 'proj',
          projectPath: '/proj',
          displayPath: '~/proj',
        },
      ],
      errors: [],
    })

    await handleGlobalList('issues', '', 0, 0, false, log, warn)

    expect(log).toHaveBeenCalledWith('[proj] No meta')
  })
})
