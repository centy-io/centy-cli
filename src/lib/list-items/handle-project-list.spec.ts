import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonListItems = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-items.js', () => ({
  daemonListItems: (...args: unknown[]) => mockDaemonListItems(...args),
}))

vi.mock('../../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('handleProjectList', () => {
  let log: ReturnType<typeof vi.fn>
  const error = (msg: string): never => {
    throw new Error(msg)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    log = vi.fn()
    mockEnsureInitialized.mockResolvedValue('/test/.centy')
  })

  it('should list items with formatted output', async () => {
    const { handleProjectList } = await import('./handle-project-list.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [
        {
          id: 'item-1',
          title: 'First item',
          metadata: { displayNumber: 1, status: 'open', priority: 2 },
        },
      ],
      totalCount: 1,
    })

    await handleProjectList('/test', 'issues', '', 0, 0, false, log, error)

    expect(log).toHaveBeenCalledWith(expect.stringContaining('#1'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('First item'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[open]'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('[P2]'))
  })

  it('should output JSON when json mode is on', async () => {
    const { handleProjectList } = await import('./handle-project-list.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [{ id: 'item-1', title: 'Test', metadata: {} }],
      totalCount: 1,
    })

    await handleProjectList('/test', 'issues', '', 0, 0, true, log, error)

    const output = JSON.parse(log.mock.calls[0][0])
    expect(Array.isArray(output)).toBe(true)
  })

  it('should show message when no items found', async () => {
    const { handleProjectList } = await import('./handle-project-list.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    await handleProjectList('/test', 'issues', '', 0, 0, false, log, error)

    expect(log).toHaveBeenCalledWith(expect.stringContaining('No issues found'))
  })

  it('should call error on NotInitializedError', async () => {
    const { handleProjectList } = await import('./handle-project-list.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Not initialized')
    )

    await expect(
      handleProjectList('/test', 'issues', '', 0, 0, false, log, error)
    ).rejects.toThrow('Not initialized')
  })

  it('should call error on daemon failure', async () => {
    const { handleProjectList } = await import('./handle-project-list.js')
    mockDaemonListItems.mockResolvedValue({
      success: false,
      error: 'Daemon error',
      items: [],
      totalCount: 0,
    })

    await expect(
      handleProjectList('/test', 'issues', '', 0, 0, false, log, error)
    ).rejects.toThrow('Daemon error')
  })

  it('should pass filter, limit, and offset to daemon', async () => {
    const { handleProjectList } = await import('./handle-project-list.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const filter = JSON.stringify({ status: { $eq: 'open' } })
    await handleProjectList('/test', 'issues', filter, 10, 5, false, log, error)

    expect(mockDaemonListItems).toHaveBeenCalledWith({
      projectPath: '/test',
      itemType: 'issues',
      filter,
      limit: 10,
      offset: 5,
    })
  })
})
