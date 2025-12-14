import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonSetProjectArchived = vi.fn()

vi.mock('../../daemon/daemon-set-project-archived.js', () => ({
  daemonSetProjectArchived: (...args: unknown[]) =>
    mockDaemonSetProjectArchived(...args),
}))

describe('ProjectArchive command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./archive.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./archive.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should archive a project successfully', async () => {
    const { default: Command } = await import('./archive.js')
    mockDaemonSetProjectArchived.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { off: false },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectArchived).toHaveBeenCalledWith({
      projectPath: '/test/project',
      isArchived: true,
    })
    expect(cmd.logs).toContain('Archived: "My Project"')
  })

  it('should unarchive a project with --off flag', async () => {
    const { default: Command } = await import('./archive.js')
    mockDaemonSetProjectArchived.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { off: true },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectArchived).toHaveBeenCalledWith({
      projectPath: '/test/project',
      isArchived: false,
    })
    expect(cmd.logs).toContain('Unarchived: "My Project"')
  })

  it('should use current directory when no path provided', async () => {
    const { default: Command } = await import('./archive.js')
    mockDaemonSetProjectArchived.mockResolvedValue({
      success: true,
      project: { name: 'Current Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { off: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonSetProjectArchived).toHaveBeenCalledWith(
      expect.objectContaining({
        isArchived: true,
      })
    )
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./archive.js')
    mockDaemonSetProjectArchived.mockResolvedValue({
      success: false,
      error: 'Project not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { off: false },
      args: { path: '/test/project' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not found')
  })
})
