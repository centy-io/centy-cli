import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetItem = vi.fn()
const mockDaemonGetIssuesByUuid = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

vi.mock('../daemon/daemon-get-issues-by-uuid.js', () => ({
  daemonGetIssuesByUuid: (...args: unknown[]) =>
    mockDaemonGetIssuesByUuid(...args),
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
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

function createMockGenericItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    itemType: 'issues',
    title: 'Test Issue',
    body: 'Test description',
    metadata: {
      displayNumber: 1,
      status: 'open',
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

describe('Issue command (shorthand for get issue)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should have get:issue alias', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command.aliases).toContain('get:issue')
  })

  it('should get issue by display number', async () => {
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      itemId: '',
      displayNumber: 1,
    })
    expect(cmd.logs.some(log => log.includes('Issue #1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Test Issue'))).toBe(true)
  })

  it('should get issue by UUID', async () => {
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      displayNumber: undefined,
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(item, null, 2))
  })

  it('should search globally with --global flag', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [
        {
          issue: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            displayNumber: 1,
            title: 'Test Issue',
            metadata: {
              status: 'open',
              priority: 1,
              priorityLabel: 'P1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
            },
          },
          projectName: 'project-a',
          projectPath: '/path/to/project-a',
        },
      ],
      totalCount: 1,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetIssuesByUuid).toHaveBeenCalledWith({
      uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 issue(s)'))).toBe(true)
  })

  it('should handle daemon get item failure', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetItem.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should error when project is not initialized', async () => {
    const { default: Command, default: IssueCommand } =
      await import('./issue.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(IssueCommand).toBeDefined()
  })

  it('should rethrow non-NotInitializedError from ensureInitialized', async () => {
    const { default: Command } = await import('./issue.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unexpected error'))

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(error && error.message).toContain('Unexpected error')
  })
})
