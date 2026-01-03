import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockEnsureInitialized = vi.fn()
const mockDaemonGetProjectVersion = vi.fn()

vi.mock('../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

vi.mock('../daemon/daemon-get-project-version.js', () => ({
  daemonGetProjectVersion: (...args: unknown[]) =>
    mockDaemonGetProjectVersion(...args),
}))

describe('Version command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./version.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./version.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./version.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, { flags: {} })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should display version info in normal mode', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.1.0',
      daemonVersion: '0.2.0',
      comparison: 'project_behind',
      degradedMode: false,
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs).toContain('Project Version: 0.1.0')
    expect(cmd.logs).toContain('Daemon Version: 0.2.0')
    expect(cmd.logs.some(log => log.includes('Update available'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./version.js')
    const versionData = {
      projectVersion: '0.1.0',
      daemonVersion: '0.1.0',
      comparison: 'equal',
      degradedMode: false,
    }
    mockDaemonGetProjectVersion.mockResolvedValue(versionData)

    const cmd = createMockCommand(Command, { flags: { json: true } })
    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(versionData, null, 2))
  })

  it('should show up to date status when versions match', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.2.0',
      daemonVersion: '0.2.0',
      comparison: 'equal',
      degradedMode: false,
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Up to date'))).toBe(true)
  })

  it('should show project ahead status', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.3.0',
      daemonVersion: '0.2.0',
      comparison: 'project_ahead',
      degradedMode: true,
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Project ahead'))).toBe(true)
    expect(cmd.warnings).toContain(
      'Running in degraded mode - project version is ahead of daemon'
    )
  })

  it('should handle unknown comparison status', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.1.0',
      daemonVersion: '0.2.0',
      comparison: 'unknown_status',
      degradedMode: false,
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('unknown_status'))).toBe(true)
  })

  it('should rethrow non-NotInitializedError errors', async () => {
    const { default: Command } = await import('./version.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, { flags: {} })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(error).toHaveProperty('message', 'Unknown error')
  })
})
