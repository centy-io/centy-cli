import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeletePr = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-delete-pr.js', () => ({
  daemonDeletePr: (...args: unknown[]) => mockDaemonDeletePr(...args),
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

describe('DeletePr command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
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

  it('should delete pr successfully with force flag', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonDeletePr.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'pr-uuid-123' },
    })
    await cmd.run()

    expect(mockDaemonDeletePr).toHaveBeenCalledWith({
      projectPath: '/test/project',
      prId: 'pr-uuid-123',
    })
    expect(cmd.logs.some(log => log.includes('Deleted PR'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('pr-uuid-123'))).toBe(true)
  })

  it('should delete pr by display number with force flag', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonDeletePr.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '5' },
    })
    await cmd.run()

    expect(mockDaemonDeletePr).toHaveBeenCalledWith({
      projectPath: '/test/project',
      prId: '5',
    })
    expect(cmd.logs.some(log => log.includes('Deleted PR 5'))).toBe(true)
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonDeletePr.mockResolvedValue({
      success: false,
      error: 'PR not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'nonexistent' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('PR not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./pr.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'test' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle other errors during initialization', async () => {
    const { default: Command } = await import('./pr.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: 'test' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./pr.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonDeletePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true, project: 'other-project' },
      args: { id: 'pr-1' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonDeletePr).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })
})
