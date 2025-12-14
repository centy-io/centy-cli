import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonMoveIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-move-issue.js', () => ({
  daemonMoveIssue: (...args: unknown[]) => mockDaemonMoveIssue(...args),
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

describe('MoveIssue command', () => {
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

  it('should move issue to different project', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveIssue.mockResolvedValue({
      success: true,
      oldDisplayNumber: 5,
      issue: { displayNumber: 12 },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '5' },
    })

    await cmd.run()

    expect(mockDaemonMoveIssue).toHaveBeenCalledWith({
      sourceProjectPath: '/source/project',
      issueId: '5',
      targetProjectPath: '/target/project',
    })
    expect(cmd.logs.some(log => log.includes('Moved issue #5 → #12'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('/target/project'))).toBe(true)
  })

  it('should move issue by UUID', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveIssue.mockResolvedValue({
      success: true,
      oldDisplayNumber: 1,
      issue: { displayNumber: 3 },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: 'abc-123-uuid' },
    })

    await cmd.run()

    expect(mockDaemonMoveIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        issueId: 'abc-123-uuid',
      })
    )
  })

  it('should handle NotInitializedError on source project', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } = await import(
      '../../utils/ensure-initialized.js'
    )
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Source project'))).toBe(true)
  })

  it('should handle NotInitializedError on target project', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } = await import(
      '../../utils/ensure-initialized.js'
    )
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized
      .mockResolvedValueOnce('/source/project/.centy')
      .mockRejectedValueOnce(new NotInitializedError('Project not initialized'))

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Target project'))).toBe(true)
  })

  it('should error when source and target are the same', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/same/project')

    const cmd = createMockCommand(Command, {
      flags: { to: '/same/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('cannot be the same'))).toBe(true)
  })

  it('should handle daemon move failure', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should use project flag for source', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/custom/source')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveIssue.mockResolvedValue({
      success: true,
      oldDisplayNumber: 1,
      issue: { displayNumber: 2 },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project', project: '/custom/source' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('/custom/source')
    expect(mockDaemonMoveIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceProjectPath: '/custom/source',
      })
    )
  })

  it('should handle non-Error throws in source ensureInitialized', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should handle non-Error throws in target ensureInitialized', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized
      .mockResolvedValueOnce('/source/project/.centy')
      .mockRejectedValueOnce('string error')

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
