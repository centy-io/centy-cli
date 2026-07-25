import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListUsers = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-users.js', () => ({
  daemonListUsers: (...args: unknown[]) => mockDaemonListUsers(...args),
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

describe('UserList command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list users successfully', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListUsers.mockResolvedValue({
      users: [
        {
          id: 'john-doe',
          name: 'John Doe',
          email: 'john@example.com',
          gitUsernames: ['johnd'],
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListUsers).toHaveBeenCalledWith({
      projectPath: '/test/project',
      gitUsername: '',
      includeDeleted: false,
    })
    expect(cmd.logs.some(log => log.includes('john-doe'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('John Doe'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('john@example.com'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('johnd'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListUsers.mockResolvedValue({
      users: [{ id: 'john-doe', name: 'John Doe', gitUsernames: [] }],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"id": "john-doe"'))).toBe(true)
  })

  it('should show empty message when no users', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListUsers.mockResolvedValue({
      users: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No users found'))).toBe(true)
  })

  it('should filter by git username', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListUsers.mockResolvedValue({
      users: [{ id: 'john', name: 'John', gitUsernames: ['johnd'] }],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, 'git-username': 'johnd' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListUsers).toHaveBeenCalledWith({
      projectPath: '/test/project',
      gitUsername: 'johnd',
      includeDeleted: false,
    })
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./list.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./list.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListUsers.mockResolvedValue({
      users: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, project: 'other-project' },
      args: {},
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })
})
