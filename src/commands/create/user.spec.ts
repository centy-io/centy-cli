import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateUser = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-create-user.js', () => ({
  daemonCreateUser: (...args: unknown[]) => mockDaemonCreateUser(...args),
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

describe('CreateUser command', () => {
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

  it('should create user successfully', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonCreateUser.mockResolvedValue({
      success: true,
      user: {
        id: 'john-doe',
        name: 'John Doe',
        email: 'john@example.com',
        gitUsernames: [],
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, name: 'John Doe', email: 'john@example.com' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateUser).toHaveBeenCalledWith({
      projectPath: '/test/project',
      id: '',
      name: 'John Doe',
      email: 'john@example.com',
      gitUsernames: [],
    })
    expect(cmd.logs.some(log => log.includes('Created user'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('john-doe'))).toBe(true)
  })

  it('should create user with custom ID', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonCreateUser.mockResolvedValue({
      success: true,
      user: { id: 'custom-id', name: 'John', gitUsernames: [] },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, name: 'John', id: 'custom-id' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'custom-id' })
    )
  })

  it('should create user with git usernames', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonCreateUser.mockResolvedValue({
      success: true,
      user: { id: 'john', name: 'John', gitUsernames: ['johnd', 'john-work'] },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        json: false,
        name: 'John',
        'git-username': ['johnd', 'john-work'],
      },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ gitUsernames: ['johnd', 'john-work'] })
    )
    expect(
      cmd.logs.some(log => log.includes('Git usernames: johnd, john-work'))
    ).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonCreateUser.mockResolvedValue({
      success: true,
      user: { id: 'john', name: 'John', gitUsernames: [] },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true, name: 'John' },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"id": "john"'))).toBe(true)
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonCreateUser.mockResolvedValue({
      success: false,
      error: 'User already exists',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, name: 'John' },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('User already exists')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./user.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false, name: 'John' },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })
})
