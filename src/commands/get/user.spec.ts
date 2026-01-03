import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetUser = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-user.js', () => ({
  daemonGetUser: (...args: unknown[]) => mockDaemonGetUser(...args),
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

describe('GetUser command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./user.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./user.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should get user details successfully', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonGetUser.mockResolvedValue({
      id: 'john-doe',
      name: 'John Doe',
      email: 'john@example.com',
      gitUsernames: ['johnd'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonGetUser).toHaveBeenCalledWith({
      projectPath: '/test/project',
      userId: 'john-doe',
    })
    expect(cmd.logs.some(log => log.includes('john-doe'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('John Doe'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('john@example.com'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('johnd'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonGetUser.mockResolvedValue({
      id: 'john-doe',
      name: 'John Doe',
      gitUsernames: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"id": "john-doe"'))).toBe(true)
  })

  it('should error when user not found', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonGetUser.mockRejectedValue(new Error('User not found'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { id: 'nonexistent' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('not found'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./user.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { id: 'john-doe' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should display timestamps', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonGetUser.mockResolvedValue({
      id: 'john-doe',
      name: 'John Doe',
      gitUsernames: [],
      createdAt: '2024-01-15',
      updatedAt: '2024-02-20',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Created:'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Updated:'))).toBe(true)
  })
})
