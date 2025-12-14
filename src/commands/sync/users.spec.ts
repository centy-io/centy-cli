import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonSyncUsers = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-sync-users.js', () => ({
  daemonSyncUsers: (...args: unknown[]) => mockDaemonSyncUsers(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
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

describe('SyncUsers command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should export the SyncUsers class', async () => {
    const { default: SyncUsers } = await import('./users.js')
    expect(SyncUsers).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: SyncUsers } = await import('./users.js')
    expect(SyncUsers.description).toBeDefined()
    expect(typeof SyncUsers.description).toBe('string')
  })

  it('should sync users and show created and skipped', async () => {
    const { default: Command } = await import('./users.js')
    mockDaemonSyncUsers.mockResolvedValue({
      success: true,
      created: ['user-id-1', 'user-id-2'],
      skipped: ['existing@example.com'],
      errors: [],
      wouldCreate: [],
      wouldSkip: [],
    })

    const cmd = createMockCommand(Command, { flags: { 'dry-run': false } })
    await cmd.run()

    expect(mockDaemonSyncUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
      })
    )
    expect(cmd.logs.some(log => log.includes('Created 2 user(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('user-id-1'))).toBe(true)
  })

  it('should show dry-run output', async () => {
    const { default: Command } = await import('./users.js')
    mockDaemonSyncUsers.mockResolvedValue({
      success: true,
      created: [],
      skipped: [],
      errors: [],
      wouldCreate: [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Doe', email: 'jane@example.com' },
      ],
      wouldSkip: [{ name: 'Existing User', email: 'existing@example.com' }],
    })

    const cmd = createMockCommand(Command, { flags: { 'dry-run': true } })
    await cmd.run()

    expect(mockDaemonSyncUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: true,
      })
    )
    expect(cmd.logs.some(log => log.includes('Would create 2 user(s)'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('John Doe'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Would skip 1 user(s)'))).toBe(
      true
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./users.js')
    const response = {
      success: true,
      created: ['user-1'],
      skipped: [],
      errors: [],
      wouldCreate: [],
      wouldSkip: [],
    }
    mockDaemonSyncUsers.mockResolvedValue(response)

    const cmd = createMockCommand(Command, { flags: { json: true } })
    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(response, null, 2))
  })

  it('should show message when no contributors found', async () => {
    const { default: Command } = await import('./users.js')
    mockDaemonSyncUsers.mockResolvedValue({
      success: true,
      created: [],
      skipped: [],
      errors: [],
      wouldCreate: [],
      wouldSkip: [],
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs).toContain('No git contributors found.')
  })

  it('should show errors from sync', async () => {
    const { default: Command } = await import('./users.js')
    mockDaemonSyncUsers.mockResolvedValue({
      success: true,
      created: [],
      skipped: [],
      errors: ['Failed to create user: invalid email'],
      wouldCreate: [],
      wouldSkip: [],
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Errors (1)'))).toBe(true)
    expect(
      cmd.logs.some(log => log.includes('Failed to create user: invalid email'))
    ).toBe(true)
  })

  it('should handle daemon sync failure', async () => {
    const { default: Command } = await import('./users.js')
    mockDaemonSyncUsers.mockResolvedValue({
      success: false,
      error: 'Git repository not found',
    })

    const cmd = createMockCommand(Command, { flags: {} })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Git repository not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./users.js')
    const { NotInitializedError } = await import(
      '../../utils/ensure-initialized.js'
    )
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, { flags: {} })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./users.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonSyncUsers.mockResolvedValue({
      success: true,
      created: [],
      skipped: [],
      errors: [],
      wouldCreate: [],
      wouldSkip: [],
    })

    const cmd = createMockCommand(Command, { flags: { project: 'other' } })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })

  it('should show dry-run message when no contributors', async () => {
    const { default: Command } = await import('./users.js')
    mockDaemonSyncUsers.mockResolvedValue({
      success: true,
      created: [],
      skipped: [],
      errors: [],
      wouldCreate: [],
      wouldSkip: [],
    })

    const cmd = createMockCommand(Command, { flags: { 'dry-run': true } })
    await cmd.run()

    expect(cmd.logs).toContain('No git contributors found.')
  })
})
