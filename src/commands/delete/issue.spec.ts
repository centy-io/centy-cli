import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockCreateInterface = vi.fn()

vi.mock('../../daemon/daemon-delete-issue.js', () => ({
  daemonDeleteIssue: (...args: unknown[]) => mockDaemonDeleteIssue(...args),
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

describe('DeleteIssue command', () => {
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

  it('should delete issue with force flag', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDeleteIssue.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeleteIssue).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
    })
    expect(cmd.logs.some(log => log.includes('Deleted issue'))).toBe(true)
  })

  it('should delete issue after confirmation', async () => {
    const { default: Command } = await import('./issue.js')
    setupReadlineMock('y')
    mockDaemonDeleteIssue.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeleteIssue).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Deleted issue'))).toBe(true)
  })

  it('should cancel when user answers no', async () => {
    const { default: Command } = await import('./issue.js')
    setupReadlineMock('n')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeleteIssue).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDeleteIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should use project flag', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonDeleteIssue.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true, project: 'other-project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./issue.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
