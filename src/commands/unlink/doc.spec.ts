import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteLink = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-delete-link.js', () => ({
  daemonDeleteLink: (...args: unknown[]) => mockDaemonDeleteLink(...args),
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

describe('UnlinkDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should remove a link from doc without type filter', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: true,
      deletedCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', target: 'issue:5' },
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonDeleteLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: 'getting-started',
      sourceType: 'doc',
      targetId: '5',
      targetType: 'issue',
      linkType: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Removed 1 link(s)'))).toBe(true)
  })

  it('should remove a link with type filter', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: true,
      deletedCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'architecture', target: 'doc:api-design' },
      flags: { type: 'relates-to' },
    })

    await cmd.run()

    expect(mockDaemonDeleteLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: 'architecture',
      sourceType: 'doc',
      targetId: 'api-design',
      targetType: 'doc',
      linkType: 'relates-to',
    })
  })

  it('should error on invalid target format', async () => {
    const { default: Command } = await import('./doc.js')

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', target: 'invalid' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
    )
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: false,
      error: 'Link not found',
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', target: 'issue:5' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Link not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', target: 'issue:5' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonDeleteLink.mockResolvedValue({
      success: true,
      deletedCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', target: 'issue:5' },
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./doc.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', target: 'issue:5' },
      flags: {},
    })

    await expect(cmd.run()).rejects.toThrow('string error')
  })
})
