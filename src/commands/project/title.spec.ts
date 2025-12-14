import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonSetProjectTitle = vi.fn()
const mockDaemonSetProjectUserTitle = vi.fn()

vi.mock('../../daemon/daemon-set-project-title.js', () => ({
  daemonSetProjectTitle: (...args: unknown[]) =>
    mockDaemonSetProjectTitle(...args),
}))

vi.mock('../../daemon/daemon-set-project-user-title.js', () => ({
  daemonSetProjectUserTitle: (...args: unknown[]) =>
    mockDaemonSetProjectUserTitle(...args),
}))

describe('ProjectTitle command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./title.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./title.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should set user-scope title successfully', async () => {
    const { default: Command } = await import('./title.js')
    mockDaemonSetProjectUserTitle.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: false, clear: false, json: false },
      args: { title: 'Custom Title' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectUserTitle).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('user-scope'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Custom Title'))).toBe(true)
  })

  it('should set project-scope title with --shared flag', async () => {
    const { default: Command } = await import('./title.js')
    mockDaemonSetProjectTitle.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: true, clear: false, json: false },
      args: { title: 'Shared Title' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectTitle).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('project-scope'))).toBe(true)
  })

  it('should clear user-scope title with --clear flag', async () => {
    const { default: Command } = await import('./title.js')
    mockDaemonSetProjectUserTitle.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: false, clear: true, json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonSetProjectUserTitle).toHaveBeenCalledWith(
      expect.objectContaining({ title: '' })
    )
    expect(cmd.logs.some(log => log.includes('Cleared'))).toBe(true)
  })

  it('should clear project-scope title with --clear --shared flags', async () => {
    const { default: Command } = await import('./title.js')
    mockDaemonSetProjectTitle.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: true, clear: true, json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonSetProjectTitle).toHaveBeenCalledWith(
      expect.objectContaining({ title: '' })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./title.js')
    const mockProject = { name: 'My Project', title: 'Custom Title' }
    mockDaemonSetProjectUserTitle.mockResolvedValue({
      success: true,
      project: mockProject,
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: false, clear: false, json: true },
      args: { title: 'Custom Title' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"name"'))).toBe(true)
  })

  it('should error when no title and no --clear flag', async () => {
    const { default: Command } = await import('./title.js')

    const cmd = createMockCommand(Command, {
      flags: { shared: false, clear: false, json: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Provide a title or use --clear to remove')
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./title.js')
    mockDaemonSetProjectUserTitle.mockResolvedValue({
      success: false,
      error: 'Project not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: false, clear: false, json: false },
      args: { title: 'Custom Title' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not found')
  })

  it('should use path flag when provided', async () => {
    const { default: Command } = await import('./title.js')
    mockDaemonSetProjectUserTitle.mockResolvedValue({
      success: true,
      project: { name: 'Other Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        shared: false,
        clear: false,
        json: false,
        path: '/other/project',
      },
      args: { title: 'Custom Title' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectUserTitle).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })
})
