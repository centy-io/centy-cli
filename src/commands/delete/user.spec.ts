import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteUser = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockCreateInterface = vi.fn()

vi.mock('../../daemon/daemon-delete-user.js', () => ({
  daemonDeleteUser: (...args: unknown[]) => mockDaemonDeleteUser(...args),
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

vi.mock('node:readline', () => ({
  createInterface: () => mockCreateInterface(),
}))

function setupReadlineMock(answer: string) {
  mockCreateInterface.mockReturnValue({
    question: (_prompt: string, callback: (answer: string) => void) => {
      callback(answer)
    },
    close: vi.fn(),
  })
}

describe('DeleteUser command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./user.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should delete user with force flag', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonDeleteUser.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonDeleteUser).toHaveBeenCalledWith({
      projectPath: '/test/project',
      userId: 'john-doe',
    })
    expect(cmd.logs.some(log => log.includes('Deleted user'))).toBe(true)
  })

  it('should delete user after confirmation', async () => {
    const { default: Command } = await import('./user.js')
    setupReadlineMock('y')
    mockDaemonDeleteUser.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonDeleteUser).toHaveBeenCalled()
  })

  it('should cancel when user answers no', async () => {
    const { default: Command } = await import('./user.js')
    setupReadlineMock('n')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonDeleteUser).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./user.js')
    const { NotInitializedError } = await import(
      '../../utils/ensure-initialized.js'
    )
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'john-doe' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonDeleteUser.mockResolvedValue({
      success: false,
      error: 'User not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('User not found')
  })

  it('should handle non-Error throws', async () => {
    const { default: Command } = await import('./user.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'john-doe' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
