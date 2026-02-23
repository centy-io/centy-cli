import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCheckDaemonConnection = vi.fn()
const mockGetProjectVersionStatus = vi.fn()

vi.mock('../daemon/check-daemon-connection.js', () => ({
  checkDaemonConnection: () => mockCheckDaemonConnection(),
}))

vi.mock('../daemon/daemon-get-project-version.js', () => ({
  getProjectVersionStatus: (...args: unknown[]) =>
    mockGetProjectVersionStatus(...args),
}))

const { default: hook } = await import('./prerun.js')

describe('prerun hook', () => {
  const mockError = vi.fn()
  const mockWarn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProjectVersionStatus.mockResolvedValue(null)
  })

  it('should skip daemon check for excluded command info', async () => {
    const options = {
      Command: { id: 'info' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should skip daemon check for excluded command shutdown', async () => {
    const options = {
      Command: { id: 'shutdown' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should skip daemon check for excluded command restart', async () => {
    const options = {
      Command: { id: 'restart' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should check daemon connection for non-excluded commands', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })

    const options = {
      Command: { id: 'init' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockCheckDaemonConnection).toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should call error when daemon is not connected', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })

    const options = {
      Command: { id: 'init' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

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
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockCheckDaemonConnection).toHaveBeenCalled()
    expect(mockError).toHaveBeenCalledWith('Custom error message')
  })

  it('should warn when project is behind daemon version', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockGetProjectVersionStatus.mockResolvedValue({
      projectVersion: '0.5.0',
      daemonVersion: '1.0.0',
      isProjectBehind: true,
    })

    const options = {
      Command: { id: 'list' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockWarn).toHaveBeenCalledWith(
      "Your project is at version 0.5.0, daemon is at 1.0.0. Run 'centy init' to migrate."
    )
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should not warn when project version is up to date', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockGetProjectVersionStatus.mockResolvedValue({
      projectVersion: '1.0.0',
      daemonVersion: '1.0.0',
      isProjectBehind: false,
    })

    const options = {
      Command: { id: 'list' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockWarn).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should not warn when project version status is null', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockGetProjectVersionStatus.mockResolvedValue(null)

    const options = {
      Command: { id: 'list' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockWarn).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should not check version when daemon is not connected', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })

    const options = {
      Command: { id: 'list' },
    }

    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError, warn: mockWarn }, options as never)

    expect(mockGetProjectVersionStatus).not.toHaveBeenCalled()
  })
})
