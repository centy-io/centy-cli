import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetProjectVersion = vi.fn()
const mockDaemonUpdateVersion = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-project-version.js', () => ({
  daemonGetProjectVersion: (...args: unknown[]) =>
    mockDaemonGetProjectVersion(...args),
}))

vi.mock('../daemon/daemon-update-version.js', () => ({
  daemonUpdateVersion: (...args: unknown[]) => mockDaemonUpdateVersion(...args),
}))

vi.mock('../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('Update command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./update.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./update.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should show already at version message', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.5.0',
      daemonVersion: '0.5.0',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('already at version'))).toBe(true)
  })

  it('should update project with force flag', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.4.0',
      daemonVersion: '0.5.0',
    })
    mockDaemonUpdateVersion.mockResolvedValue({
      success: true,
      fromVersion: '0.4.0',
      toVersion: '0.5.0',
      migrationsApplied: ['0.4.1', '0.5.0'],
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonUpdateVersion).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Updated project'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Migrations applied'))).toBe(true)
  })

  it('should use target version when specified', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.4.0',
      daemonVersion: '0.6.0',
    })
    mockDaemonUpdateVersion.mockResolvedValue({
      success: true,
      fromVersion: '0.4.0',
      toVersion: '0.5.0',
      migrationsApplied: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true, target: '0.5.0' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonUpdateVersion).toHaveBeenCalledWith(
      expect.objectContaining({ targetVersion: '0.5.0' })
    )
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.4.0',
      daemonVersion: '0.5.0',
    })
    mockDaemonUpdateVersion.mockResolvedValue({
      success: false,
      error: 'Migration failed',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Migration failed')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./update.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle update with no migrations', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonGetProjectVersion.mockResolvedValue({
      projectVersion: '0.4.0',
      daemonVersion: '0.5.0',
    })
    mockDaemonUpdateVersion.mockResolvedValue({
      success: true,
      fromVersion: '0.4.0',
      toVersion: '0.5.0',
      migrationsApplied: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Updated project'))).toBe(true)
    expect(cmd.logs.every(log => !log.includes('Migrations applied'))).toBe(true)
  })
})
