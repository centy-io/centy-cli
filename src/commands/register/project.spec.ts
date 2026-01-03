import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonRegisterProject = vi.fn()
const mockDaemonInit = vi.fn()

vi.mock('../../daemon/daemon-register-project.js', () => ({
  daemonRegisterProject: (...args: unknown[]) =>
    mockDaemonRegisterProject(...args),
}))

vi.mock('../../daemon/daemon-init.js', () => ({
  daemonInit: (...args: unknown[]) => mockDaemonInit(...args),
}))

describe('RegisterProject command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDaemonInit.mockResolvedValue({ success: true })
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

  it('should register a project successfully', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonRegisterProject.mockResolvedValue({
      success: true,
      project: { name: 'My Project', path: '/test/project', initialized: true },
    })

    const cmd = createMockCommand(Command, {
      flags: { init: true },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonRegisterProject).toHaveBeenCalledWith({
      projectPath: '/test/project',
    })
    expect(cmd.logs.some(log => log.includes('Registered'))).toBe(true)
  })

  it('should use current directory when no path provided', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonRegisterProject.mockResolvedValue({
      success: true,
      project: { name: 'Current Project', path: '/current', initialized: true },
    })

    const cmd = createMockCommand(Command, {
      flags: { init: true },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonRegisterProject).toHaveBeenCalled()
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonRegisterProject.mockResolvedValue({
      success: false,
      error: 'Project already registered',
    })

    const cmd = createMockCommand(Command, {
      flags: { init: true },
      args: { path: '/test/project' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project already registered')
  })

  it('should auto-initialize when project not initialized', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonRegisterProject.mockResolvedValue({
      success: true,
      project: {
        name: 'My Project',
        path: '/test/project',
        initialized: false,
      },
    })
    mockDaemonInit.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { init: true },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonInit).toHaveBeenCalledWith({
      projectPath: '/test/project',
      force: true,
    })
  })

  it('should skip init when --no-init flag is used', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonRegisterProject.mockResolvedValue({
      success: true,
      project: {
        name: 'My Project',
        path: '/test/project',
        initialized: false,
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { init: false },
      args: { path: '/test/project' },
    })

    await cmd.run()

    expect(mockDaemonInit).not.toHaveBeenCalled()
  })
})
