import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCheckDaemonConnection = vi.fn()
const mockGetProjectVersionStatus = vi.fn()
const mockAssertInitialized = vi.fn()

vi.mock('../daemon/check-daemon-connection.js', () => ({
  checkDaemonConnection: () => mockCheckDaemonConnection(),
}))

vi.mock('../daemon/daemon-get-project-version.js', () => ({
  getProjectVersionStatus: (...args: unknown[]) =>
    mockGetProjectVersionStatus(...args),
}))

vi.mock('../lib/assert/index.js', () => ({
  assertInitialized: (...args: unknown[]) => mockAssertInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(cwd: string) {
      super(`No .centy folder found in '${cwd}'.`)
      this.name = 'NotInitializedError'
    }
  },
}))

const { default: hook } = await import('./prerun.js')

describe('prerun hook', () => {
  const mockError = vi.fn()
  const mockWarn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProjectVersionStatus.mockResolvedValue(null)
    mockAssertInitialized.mockResolvedValue('/project/.centy')
  })

  it('should skip daemon check for excluded command info', async () => {
    const options = {
      Command: { id: 'info' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should skip daemon check for excluded command shutdown', async () => {
    const options = {
      Command: { id: 'shutdown' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should skip daemon check for excluded command restart', async () => {
    const options = {
      Command: { id: 'restart' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockCheckDaemonConnection).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should check daemon connection for non-excluded commands', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })

    const options = {
      Command: { id: 'init' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockCheckDaemonConnection).toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should call error when daemon is not connected', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })

    const options = {
      Command: { id: 'init' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

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
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

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
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

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
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockWarn).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should not warn when project version status is null', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockGetProjectVersionStatus.mockResolvedValue(null)

    const options = {
      Command: { id: 'list' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockWarn).not.toHaveBeenCalled()
    expect(mockError).not.toHaveBeenCalled()
  })

  it('should not check version when daemon is not connected', async () => {
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })

    const options = {
      Command: { id: 'list' },
      argv: [],
    }

    await hook.call({ error: mockError, warn: mockWarn }, options)

    expect(mockGetProjectVersionStatus).not.toHaveBeenCalled()
  })

  describe('initialization check', () => {
    it('should check initialization for repo-context commands', async () => {
      mockCheckDaemonConnection.mockResolvedValue({ connected: true })

      const options = {
        Command: { id: 'list' },
        argv: [],
      }

      await hook.call({ error: mockError, warn: mockWarn }, options)

      expect(mockAssertInitialized).toHaveBeenCalled()
      expect(mockError).not.toHaveBeenCalled()
    })

    it('should error when project is not initialized', async () => {
      mockCheckDaemonConnection.mockResolvedValue({ connected: true })
      const { NotInitializedError } = await import('../lib/assert/index.js')
      mockAssertInitialized.mockRejectedValue(
        new NotInitializedError('/my/project')
      )

      const options = {
        Command: { id: 'list' },
        argv: [],
      }

      await hook.call({ error: mockError, warn: mockWarn }, options)

      expect(mockError).toHaveBeenCalledWith(
        expect.stringContaining('/my/project')
      )
    })

    it('should skip initialization check for init command', async () => {
      mockCheckDaemonConnection.mockResolvedValue({ connected: true })

      const options = {
        Command: { id: 'init' },
        argv: [],
      }

      await hook.call({ error: mockError, warn: mockWarn }, options)

      expect(mockAssertInitialized).not.toHaveBeenCalled()
    })

    it('should skip initialization check for version command', async () => {
      mockCheckDaemonConnection.mockResolvedValue({ connected: true })

      const options = {
        Command: { id: 'version' },
        argv: [],
      }

      await hook.call({ error: mockError, warn: mockWarn }, options)

      expect(mockAssertInitialized).not.toHaveBeenCalled()
    })

    it('should skip initialization check when --project flag is provided', async () => {
      mockCheckDaemonConnection.mockResolvedValue({ connected: true })

      const options = {
        Command: { id: 'list' },
        argv: ['issues', '--project', 'centy-daemon'],
      }

      await hook.call({ error: mockError, warn: mockWarn }, options)

      expect(mockAssertInitialized).not.toHaveBeenCalled()
      expect(mockError).not.toHaveBeenCalled()
    })

    it('should skip initialization check for excluded commands', async () => {
      mockCheckDaemonConnection.mockResolvedValue({ connected: true })

      // info is excluded from daemon check too, so we test cockpit (excluded from daemon)
      const options = {
        Command: { id: 'info' },
        argv: [],
      }

      await hook.call({ error: mockError, warn: mockWarn }, options)

      expect(mockAssertInitialized).not.toHaveBeenCalled()
    })
  })
})
