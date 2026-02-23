import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdateUser = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-update-user.js', () => ({
  daemonUpdateUser: (...args: unknown[]) => mockDaemonUpdateUser(...args),
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

describe('UserUpdate command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should export the UserUpdate class', async () => {
    const { default: UserUpdate } = await import('./update.js')
    expect(UserUpdate).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: UserUpdate } = await import('./update.js')
    expect(UserUpdate.description).toBeDefined()
    expect(typeof UserUpdate.description).toBe('string')
  })

  it('should have update:user alias', async () => {
    const { default: UserUpdate } = await import('./update.js')
    expect(UserUpdate.aliases).toContain('update:user')
  })

  it('should have edit:user alias', async () => {
    const { default: UserUpdate } = await import('./update.js')
    expect(UserUpdate.aliases).toContain('edit:user')
  })

  it('should update user name', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user: {
        id: 'john-doe',
        name: 'John D.',
        email: 'john@example.com',
        gitUsernames: ['johnd'],
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'John D.', json: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonUpdateUser).toHaveBeenCalledWith({
      projectPath: '/test/project',
      userId: 'john-doe',
      name: 'John D.',
      email: '',
      gitUsernames: [],
    })
    expect(cmd.logs.some(log => log.includes('Updated user: john-doe'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('Name: John D.'))).toBe(true)
  })

  it('should update user email', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user: {
        id: 'jane-doe',
        name: 'Jane Doe',
        email: 'jane.new@example.com',
        gitUsernames: [],
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { email: 'jane.new@example.com', json: false },
      args: { id: 'jane-doe' },
    })

    await cmd.run()

    expect(mockDaemonUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane.new@example.com',
      })
    )
    expect(cmd.logs.some(log => log.includes('jane.new@example.com'))).toBe(
      true
    )
  })

  it('should update git usernames', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user: {
        id: 'test-user',
        name: 'Test User',
        email: '',
        gitUsernames: ['newuser1', 'newuser2'],
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { 'git-username': ['newuser1', 'newuser2'], json: false },
      args: { id: 'test-user' },
    })

    await cmd.run()

    expect(mockDaemonUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        gitUsernames: ['newuser1', 'newuser2'],
      })
    )
    expect(
      cmd.logs.some(log => log.includes('Git usernames: newuser1, newuser2'))
    ).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./update.js')
    const user = {
      id: 'john-doe',
      name: 'John Doe',
      email: 'john@example.com',
      gitUsernames: [],
    }
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user,
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'John Doe', json: true },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(user, null, 2))
  })

  it('should handle daemon update failure', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonUpdateUser.mockResolvedValue({
      success: false,
      error: 'User not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'Test', json: false },
      args: { id: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('User not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./update.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { name: 'Test', json: false },
      args: { id: 'john-doe' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./update.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user: { id: 'test', name: 'Test', email: '', gitUsernames: [] },
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'Test', json: false, project: 'other-project' },
      args: { id: 'test' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })

  it('should not show email when empty', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user: { id: 'test', name: 'Test', email: '', gitUsernames: [] },
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'Test', json: false },
      args: { id: 'test' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Email:'))).toBe(false)
  })

  it('should not show git usernames when empty', async () => {
    const { default: Command } = await import('./update.js')
    mockDaemonUpdateUser.mockResolvedValue({
      success: true,
      user: {
        id: 'test',
        name: 'Test',
        email: 'test@example.com',
        gitUsernames: [],
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'Test', json: false },
      args: { id: 'test' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Git usernames:'))).toBe(false)
  })
})
