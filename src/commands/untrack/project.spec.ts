import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUntrackProject = vi.fn()

vi.mock('../../daemon/daemon-untrack-project.js', () => ({
  daemonUntrackProject: (...args: unknown[]) =>
    mockDaemonUntrackProject(...args),
}))

describe('UntrackProject command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./project.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./project.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should untrack a project successfully with --force flag', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonUntrackProject.mockResolvedValue({
      success: true,
      project: { name: 'My Project', path: '/test/project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonUntrackProject).toHaveBeenCalledWith({
      projectPath: '/test/project',
    })
    expect(cmd.logs.some(log => log.includes('Untracked'))).toBe(true)
  })

  it('should use current directory when no path provided', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonUntrackProject.mockResolvedValue({
      success: true,
      project: { name: 'Current Project', path: '/current' },
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonUntrackProject).toHaveBeenCalled()
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonUntrackProject.mockResolvedValue({
      success: false,
      error: 'Project not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { path: '/test/project' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not found')
  })

  it('should prompt for confirmation without --force and proceed on y', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonUntrackProject.mockResolvedValue({
      success: true,
      project: { name: 'My Project', path: '/test/project' },
    })

    // Mock readline
    const mockRl = {
      question: vi.fn((_, callback) => callback('y')),
      close: vi.fn(),
    }
    vi.doMock('node:readline', () => ({
      createInterface: () => mockRl,
    }))

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonUntrackProject).toHaveBeenCalled()
  })

  it('should prompt for confirmation without --force and cancel on n', async () => {
    const { default: Command } = await import('./project.js')

    // Mock readline
    const mockRl = {
      question: vi.fn((_, callback) => callback('n')),
      close: vi.fn(),
    }
    vi.doMock('node:readline', () => ({
      createInterface: () => mockRl,
    }))

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonUntrackProject).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })
})
