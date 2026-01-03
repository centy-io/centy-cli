import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdatePlan = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockReadFile = vi.fn()

vi.mock('../../daemon/daemon-update-plan.js', () => ({
  daemonUpdatePlan: (...args: unknown[]) => mockDaemonUpdatePlan(...args),
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

vi.mock('node:fs/promises', () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
}))

describe('AddPlan command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./plan.js')

    expect(Command.description).toBeDefined()
    expect(Command.aliases).toContain('update:plan')
    expect(Command.aliases).toContain('set:plan')
  })

  it('should add plan from file', async () => {
    const { default: Command } = await import('./plan.js')
    mockReadFile.mockResolvedValue('# Plan Content\n- Step 1\n- Step 2')
    mockDaemonUpdatePlan.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md' },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockReadFile).toHaveBeenCalledWith('/path/to/plan.md', 'utf-8')
    expect(mockDaemonUpdatePlan).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
      content: '# Plan Content\n- Step 1\n- Step 2',
    })
    expect(cmd.logs.some(log => log.includes('Plan updated for issue 1'))).toBe(
      true
    )
  })

  it('should handle file not found error', async () => {
    const { default: Command } = await import('./plan.js')
    const error = new Error('ENOENT: no such file or directory')
    mockReadFile.mockRejectedValue(error)

    const cmd = createMockCommand(Command, {
      flags: { file: '/nonexistent/plan.md' },
      args: { issueId: '1' },
    })

    const { error: cmdError } = await runCommandSafely(cmd)

    expect(cmdError).toBeDefined()
    expect(cmd.errors.some(e => e.includes('File not found'))).toBe(true)
  })

  it('should handle file read errors', async () => {
    const { default: Command } = await import('./plan.js')
    const error = new Error('Permission denied')
    mockReadFile.mockRejectedValue(error)

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md' },
      args: { issueId: '1' },
    })

    const { error: cmdError } = await runCommandSafely(cmd)

    expect(cmdError).toBeDefined()
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./plan.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md' },
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon update failure', async () => {
    const { default: Command } = await import('./plan.js')
    mockReadFile.mockResolvedValue('# Plan')
    mockDaemonUpdatePlan.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md' },
      args: { issueId: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should use project flag', async () => {
    const { default: Command } = await import('./plan.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockReadFile.mockResolvedValue('# Plan')
    mockDaemonUpdatePlan.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md', project: 'other-project' },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./plan.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md' },
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should handle non-Error throws in readFile', async () => {
    const { default: Command } = await import('./plan.js')
    mockReadFile.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { file: '/path/to/plan.md' },
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
