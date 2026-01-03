import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonAssignIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-assign-issue.js', () => ({
  daemonAssignIssue: (...args: unknown[]) => mockDaemonAssignIssue(...args),
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

describe('AssignIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
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

  it('should assign users to an issue successfully', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonAssignIssue.mockResolvedValue({
      success: true,
      issue: {
        displayNumber: 1,
        metadata: { assignees: ['john-doe', 'jane-doe'] },
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe', 'jane-doe'],
    })

    await cmd.run()

    expect(mockDaemonAssignIssue).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
      userIds: ['john-doe', 'jane-doe'],
    })
    expect(cmd.logs.some(log => log.includes('Assigned'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('john-doe, jane-doe'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issue.js')
    const mockIssue = {
      displayNumber: 1,
      metadata: { assignees: ['john-doe'] },
    }
    mockDaemonAssignIssue.mockResolvedValue({
      success: true,
      issue: mockIssue,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: true },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe'],
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"displayNumber": 1'))).toBe(true)
  })

  it('should handle error when no user IDs provided', async () => {
    const { default: Command } = await import('./issue.js')

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { issueId: '1', userIds: '' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false },
      args: { issueId: '1', userIds: '' },
      argv: ['1'],
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('At least one user ID is required')
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonAssignIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe'],
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe'],
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should rethrow non-NotInitializedError errors', async () => {
    const { default: Command } = await import('./issue.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe'],
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(error).toHaveProperty('message', 'Unknown error')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonAssignIssue.mockResolvedValue({
      success: true,
      issue: {
        displayNumber: 1,
        metadata: { assignees: ['john-doe'] },
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, project: 'other-project' },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false, project: 'other-project' },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe'],
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonAssignIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/other/project',
      })
    )
  })

  it('should display no assignees message when empty', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonAssignIssue.mockResolvedValue({
      success: true,
      issue: {
        displayNumber: 1,
        metadata: { assignees: [] },
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
    })
    cmd.parse = vi.fn().mockResolvedValue({
      flags: { json: false },
      args: { issueId: '1', userIds: 'john-doe' },
      argv: ['1', 'john-doe'],
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('none'))).toBe(true)
  })
})
