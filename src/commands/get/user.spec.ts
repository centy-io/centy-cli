import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
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

function createMockGenericUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'john-doe',
    itemType: 'users',
    title: 'John Doe',
    body: '',
    metadata: {
      displayNumber: 0,
      status: '',
      priority: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

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
    const item = createMockGenericUser()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'users',
      itemId: 'john-doe',
    })
    expect(cmd.logs.some(log => log.includes('john-doe'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('John Doe'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./user.js')
    const item = createMockGenericUser()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"id": "john-doe"'))).toBe(true)
  })

  it('should error when user not found', async () => {
    const { default: Command } = await import('./user.js')
    mockDaemonGetItem.mockResolvedValue({
      success: false,
      error: 'User "nonexistent" not found',
    })

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
    const item = createMockGenericUser()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { id: 'john-doe' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Created:'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Updated:'))).toBe(true)
  })
})
