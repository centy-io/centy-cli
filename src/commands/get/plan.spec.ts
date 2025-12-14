import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetPlan = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockWriteFile = vi.fn()

vi.mock('../../daemon/daemon-get-plan.js', () => ({
  daemonGetPlan: (...args: unknown[]) => mockDaemonGetPlan(...args),
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
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}))

describe('GetPlan command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./plan.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./plan.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should get plan and print to stdout', async () => {
    const { default: Command } = await import('./plan.js')
    mockDaemonGetPlan.mockResolvedValue({
      exists: true,
      content: '## Plan Content\n- Step 1\n- Step 2',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetPlan).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
    })
    expect(cmd.logs.some(log => log.includes('Plan Content'))).toBe(true)
  })

  it('should save plan to file when output flag is set', async () => {
    const { default: Command } = await import('./plan.js')
    mockDaemonGetPlan.mockResolvedValue({
      exists: true,
      content: '## Plan Content',
    })

    const cmd = createMockCommand(Command, {
      flags: { output: './plan.md' },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockWriteFile).toHaveBeenCalledWith('./plan.md', '## Plan Content')
    expect(cmd.logs.some(log => log.includes('Saved plan to ./plan.md'))).toBe(true)
  })

  it('should error when plan not found', async () => {
    const { default: Command } = await import('./plan.js')
    mockDaemonGetPlan.mockResolvedValue({
      exists: false,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '99' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('No plan found'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./plan.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./plan.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetPlan.mockResolvedValue({
      exists: true,
      content: 'content',
    })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other-project' },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonGetPlan).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })
})
