import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCheckDaemonConnection = vi.fn()

vi.mock('../daemon/check-daemon-connection.js', () => ({
  checkDaemonConnection: () => mockCheckDaemonConnection(),
}))

const { default: hook } = await import('./prerun.js')

describe('prerun hook', () => {
  const mockError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should skip daemon check for excluded command info', async () => {
    const options = {
      Command: { id: 'info' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError }, options as never)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should skip daemon check for excluded command shutdown', async () => {
    const options = {
      Command: { id: 'shutdown' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError }, options as never)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should skip daemon check for excluded command restart', async () => {
    const options = {
      Command: { id: 'restart' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError }, options as never)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should check daemon connection for non-excluded commands', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })

    const options = {
      Command: { id: 'init' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError }, options as never)

    expect(mockCheckDaemonConnection).toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should call error when daemon is not connected', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })

    const options = {
      Command: { id: 'init' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError }, options as never)

    expect(mockCheckDaemonConnection).toHaveBeenCalled()
    expect(mockError).toHaveBeenCalledWith(
      'Centy daemon is not running. Please start the daemon first.'
    )
  })

  it('should use custom error message when provided', async () => {
    mockCheckDaemonConnection.mockResolvedValue({
      connected: false,
      error: 'Custom error message',
    })

    const options = {
      Command: { id: 'list:issues' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError }, options as never)

    expect(mockCheckDaemonConnection).toHaveBeenCalled()
    expect(mockError).toHaveBeenCalledWith('Custom error message')
  })
})
