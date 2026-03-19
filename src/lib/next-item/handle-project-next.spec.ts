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

const noopError = (msg: string): never => {
  throw new Error(msg)
}

describe('handleProjectNext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureInitialized.mockResolvedValue('/test/.centy')
  })

  it('should log no items message when result is empty', async () => {
    const { handleProjectNext } = await import('./handle-project-next.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })
    const logs: string[] = []
    await handleProjectNext(
      '/test',
      'issues',
      'issue',
      '{}',
      'open',
      false,
      msg => logs.push(msg),
      noopError
    )
    expect(logs[0]).toBe('No open issue found.')
  })

  it('should log formatted item line', async () => {
    const { handleProjectNext } = await import('./handle-project-next.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [
        {
          id: '1',
          title: 'Bug',
          body: '',
          metadata: { displayNumber: 3, status: 'open', priority: 1 },
        },
      ],
      totalCount: 1,
    })
    const logs: string[] = []
    await handleProjectNext(
      '/test',
      'issues',
      'issue',
      '{}',
      'open',
      false,
      msg => logs.push(msg),
      noopError
    )
    expect(logs[0]).toContain('#3')
    expect(logs[0]).toContain('Bug')
  })

  it('should output JSON when jsonMode is true', async () => {
    const { handleProjectNext } = await import('./handle-project-next.js')
    const item = {
      id: '1',
      title: 'Bug',
      body: '',
      metadata: { displayNumber: 1, status: 'open', priority: 0 },
    }
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [item],
      totalCount: 1,
    })
    const logs: string[] = []
    await handleProjectNext(
      '/test',
      'issues',
      'issue',
      '{}',
      'open',
      true,
      msg => logs.push(msg),
      noopError
    )
    expect(JSON.parse(logs[0])).toMatchObject({ id: '1' })
  })

  it('should call error when initialization fails with NotInitializedError', async () => {
    const { handleProjectNext } = await import('./handle-project-next.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(new NotInitializedError('not init'))
    const errors: string[] = []
    const captureError = (msg: string): never => {
      errors.push(msg)
      throw new Error(msg)
    }
    await handleProjectNext(
      '/test',
      'issues',
      'issue',
      '{}',
      'open',
      false,
      () => {},
      captureError
    ).catch(() => {})
    expect(errors).toContain('not init')
  })
})
