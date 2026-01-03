import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetProjectInfo = vi.fn()

vi.mock('../../daemon/daemon-get-project-info.js', () => ({
  daemonGetProjectInfo: (...args: unknown[]) =>
    mockDaemonGetProjectInfo(...args),
}))

describe('GetProject command', () => {
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

  it('should get project info with default path', async () => {
    const { default: Command } = await import('./project.js')
    const project = {
      name: 'test-project',
      path: '/test/project',
      initialized: true,
      issueCount: 5,
      docCount: 2,
      firstAccessed: '2024-01-01',
      lastAccessed: '2024-01-15',
    }
    mockDaemonGetProjectInfo.mockResolvedValue({ found: true, project })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockDaemonGetProjectInfo).toHaveBeenCalled()
    expect(cmd.logs.length).toBeGreaterThan(0)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./project.js')
    const project = {
      name: 'test-project',
      path: '/test/project',
      initialized: true,
      issueCount: 5,
      docCount: 2,
      firstAccessed: '2024-01-01',
      lastAccessed: '2024-01-15',
    }
    mockDaemonGetProjectInfo.mockResolvedValue({ found: true, project })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(project, null, 2))
  })

  it('should handle project not found', async () => {
    const { default: Command } = await import('./project.js')
    mockDaemonGetProjectInfo.mockResolvedValue({ found: false })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { path: '/nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('Project not found')
  })

  it('should use path arg when provided', async () => {
    const { default: Command } = await import('./project.js')
    const project = {
      name: 'other-project',
      path: '/other/project',
      initialized: true,
      issueCount: 0,
      docCount: 0,
      firstAccessed: '2024-01-01',
      lastAccessed: '2024-01-15',
    }
    mockDaemonGetProjectInfo.mockResolvedValue({ found: true, project })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { path: '/other/project' },
    })

    await cmd.run()

    expect(mockDaemonGetProjectInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/other/project',
      })
    )
  })
})
