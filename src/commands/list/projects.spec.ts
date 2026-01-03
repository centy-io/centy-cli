import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockDaemonListProjects = vi.fn()

vi.mock('../../daemon/daemon-list-projects.js', () => ({
  daemonListProjects: (...args: unknown[]) => mockDaemonListProjects(...args),
}))

describe('ListProjects command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./projects.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./projects.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list all projects', async () => {
    const { default: Command } = await import('./projects.js')
    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { name: 'project-1', path: '/path/to/project-1' },
        { name: 'project-2', path: '/path/to/project-2' },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonListProjects).toHaveBeenCalled()
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./projects.js')
    const projects = [{ name: 'project-1', path: '/path/to/project-1' }]
    mockDaemonListProjects.mockResolvedValue({ projects })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(projects, null, 2))
  })

  it('should handle empty project list', async () => {
    const { default: Command } = await import('./projects.js')
    mockDaemonListProjects.mockResolvedValue({ projects: [] })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonListProjects).toHaveBeenCalled()
  })
})
