import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDuplicateIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-duplicate-issue.js', () => ({
  daemonDuplicateIssue: (...args: unknown[]) =>
    mockDaemonDuplicateIssue(...args),
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

describe('DuplicateIssue command', () => {
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

  it('should duplicate issue in same project', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDuplicateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 2, title: 'Copy of Original' },
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDuplicateIssue).toHaveBeenCalledWith({
      sourceProjectPath: '/test/project',
      issueId: '1',
      targetProjectPath: '/test/project',
      newTitle: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Duplicated issue'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('in current project'))).toBe(true)
  })

  it('should duplicate issue to different project', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonDuplicateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 5, title: 'Duplicated Issue' },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDuplicateIssue).toHaveBeenCalledWith({
      sourceProjectPath: '/source/project',
      issueId: '1',
      targetProjectPath: '/target/project',
      newTitle: undefined,
    })
    expect(cmd.logs.some(log => log.includes('in /target/project'))).toBe(true)
  })

  it('should duplicate issue with custom title', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDuplicateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 2, title: 'Custom Title' },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Custom Title' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDuplicateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        newTitle: 'Custom Title',
      })
    )
  })

  it('should handle NotInitializedError on source project', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Source project'))).toBe(true)
  })

  it('should handle NotInitializedError on target project', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
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

  it('should handle daemon duplicate failure', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDuplicateIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { id: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle non-Error throws in source ensureInitialized', async () => {
    const { default: Command } = await import('./issue.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: {},
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
