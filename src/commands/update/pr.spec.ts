import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdatePr = vi.fn()
const mockDaemonGetPrByDisplayNumber = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-update-pr.js', () => ({
  daemonUpdatePr: (...args: unknown[]) => mockDaemonUpdatePr(...args),
}))

vi.mock('../../daemon/daemon-get-pr-by-display-number.js', () => ({
  daemonGetPrByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetPrByDisplayNumber(...args),
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

describe('UpdatePr command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./pr.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./pr.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should update PR title', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { title: 'New PR Title' },
    })
    await cmd.run()

    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        prId: 'pr-uuid-123',
        title: 'New PR Title',
      })
    )
    expect(cmd.logs.some(log => log.includes('Updated PR #1'))).toBe(true)
  })

  it('should update PR status', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { status: 'merged' },
    })
    await cmd.run()

    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'merged',
      })
    )
  })

  it('should update PR priority', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { priority: 'high' },
    })
    await cmd.run()

    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 1,
      })
    )
  })

  it('should update source and target branches', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { source: 'feature/new-branch', target: 'develop' },
    })
    await cmd.run()

    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceBranch: 'feature/new-branch',
        targetBranch: 'develop',
      })
    )
  })

  it('should update linked issues', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { issues: 'issue-1, issue-2, issue-3' },
    })
    await cmd.run()

    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedIssues: ['issue-1', 'issue-2', 'issue-3'],
      })
    )
  })

  it('should update reviewers', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { reviewers: 'alice, bob' },
    })
    await cmd.run()

    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewers: ['alice', 'bob'],
      })
    )
  })

  it('should work with UUID directly', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: 'abc-123-def-456' },
      flags: { title: 'New Title' },
    })
    await cmd.run()

    expect(mockDaemonGetPrByDisplayNumber).not.toHaveBeenCalled()
    expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        prId: 'abc-123-def-456',
      })
    )
  })

  it('should error when no fields are specified', async () => {
    const { default: Command } = await import('./pr.js')

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('At least one field must be specified to update.')
  })

  it('should handle daemon update failure', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid-123' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: false,
      error: 'PR not found',
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { title: 'New Title' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('PR not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./pr.js')
    const { NotInitializedError } = await import(
      '../../utils/ensure-initialized.js'
    )
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { title: 'New Title' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./pr.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({ id: 'pr-uuid' })
    mockDaemonUpdatePr.mockResolvedValue({
      success: true,
      pr: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1' },
      flags: { title: 'Test', project: 'other-project' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
