import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateLink = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-create-link.js', () => ({
  daemonCreateLink: (...args: unknown[]) => mockDaemonCreateLink(...args),
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

describe('LinkIssue command', () => {
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

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create a link between issue and target', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: 'issue:2' },
    })

    await cmd.run()

    expect(mockDaemonCreateLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: '1',
      sourceType: 'issue',
      targetId: '2',
      targetType: 'issue',
      linkType: 'blocks',
    })
    expect(cmd.logs.some(log => log.includes('Created link'))).toBe(true)
  })

  it('should create a link to a doc target', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: {
        id: '1',
        linkType: 'relates-to',
        target: 'doc:getting-started',
      },
    })

    await cmd.run()

    expect(mockDaemonCreateLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: '1',
      sourceType: 'issue',
      targetId: 'getting-started',
      targetType: 'doc',
      linkType: 'relates-to',
    })
  })

  it('should error on invalid target format', async () => {
    const { default: Command } = await import('./issue.js')

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: 'invalid' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
    )
  })

  it('should error on empty target type', async () => {
    const { default: Command } = await import('./issue.js')

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: ':2' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
    )
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateLink.mockResolvedValue({
      success: false,
      error: 'Link already exists',
    })

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: 'issue:2' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Link already exists')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: 'issue:2' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: 'issue:2' },
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./issue.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      args: { id: '1', linkType: 'blocks', target: 'issue:2' },
    })

    await expect(cmd.run()).rejects.toThrow('string error')
  })
})
