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

describe('LinkDoc command', () => {
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

  it('should create a link from doc to issue', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: {
        slug: 'getting-started',
        linkType: 'relates-to',
        target: 'issue:5',
      },
    })

    await cmd.run()

    expect(mockDaemonCreateLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: 'getting-started',
      sourceType: 'doc',
      targetId: '5',
      targetType: 'issue',
      linkType: 'relates-to',
    })
    expect(cmd.logs.some(log => log.includes('Created link'))).toBe(true)
  })

  it('should create a link from doc to doc', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: {
        slug: 'architecture',
        linkType: 'parent-of',
        target: 'doc:api-design',
      },
    })

    await cmd.run()

    expect(mockDaemonCreateLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: 'architecture',
      sourceType: 'doc',
      targetId: 'api-design',
      targetType: 'doc',
      linkType: 'parent-of',
    })
  })

  it('should error on invalid target format', async () => {
    const { default: Command } = await import('./doc.js')

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started', linkType: 'relates-to', target: 'bad' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
    )
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateLink.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      args: {
        slug: 'nonexistent',
        linkType: 'relates-to',
        target: 'issue:1',
      },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: {
        slug: 'getting-started',
        linkType: 'relates-to',
        target: 'issue:5',
      },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: {
        slug: 'getting-started',
        linkType: 'relates-to',
        target: 'issue:5',
      },
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./doc.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      args: {
        slug: 'getting-started',
        linkType: 'relates-to',
        target: 'issue:5',
      },
    })

    await expect(cmd.run()).rejects.toThrow('string error')
  })
})
