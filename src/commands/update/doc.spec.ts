import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdateDoc = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-update-doc.js', () => ({
  daemonUpdateDoc: (...args: unknown[]) => mockDaemonUpdateDoc(...args),
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

describe('UpdateDoc command', () => {
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

  it('should have edit:doc alias', async () => {
    const { default: Command } = await import('./doc.js')
    expect(Command.aliases).toContain('edit:doc')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./doc.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should update doc title', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonUpdateDoc.mockResolvedValue({
      success: true,
      doc: { title: 'New Title', slug: 'getting-started' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: { title: 'New Title' },
    })
    await cmd.run()

    expect(mockDaemonUpdateDoc).toHaveBeenCalledWith({
      projectPath: '/test/project',
      slug: 'getting-started',
      title: 'New Title',
      content: '',
      newSlug: '',
    })
    expect(cmd.logs.some(log => log.includes('Updated doc'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('New Title'))).toBe(true)
  })

  it('should update doc content', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonUpdateDoc.mockResolvedValue({
      success: true,
      doc: { title: 'API Reference', slug: 'api-reference' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'api-reference' },
      flags: { content: '# New Content' },
    })
    await cmd.run()

    expect(mockDaemonUpdateDoc).toHaveBeenCalledWith({
      projectPath: '/test/project',
      slug: 'api-reference',
      title: '',
      content: '# New Content',
      newSlug: '',
    })
  })

  it('should rename doc slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonUpdateDoc.mockResolvedValue({
      success: true,
      doc: { title: 'Getting Started', slug: 'new-slug' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'old-slug' },
      flags: { 'new-slug': 'new-slug' },
    })
    await cmd.run()

    expect(mockDaemonUpdateDoc).toHaveBeenCalledWith({
      projectPath: '/test/project',
      slug: 'old-slug',
      title: '',
      content: '',
      newSlug: 'new-slug',
    })
  })

  it('should update multiple fields at once', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonUpdateDoc.mockResolvedValue({
      success: true,
      doc: { title: 'Updated Title', slug: 'updated-slug' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'original-slug' },
      flags: {
        title: 'Updated Title',
        content: '# Updated',
        'new-slug': 'updated-slug',
      },
    })
    await cmd.run()

    expect(mockDaemonUpdateDoc).toHaveBeenCalledWith({
      projectPath: '/test/project',
      slug: 'original-slug',
      title: 'Updated Title',
      content: '# Updated',
      newSlug: 'updated-slug',
    })
  })

  it('should error when no fields are specified', async () => {
    const { default: Command } = await import('./doc.js')

    const cmd = createMockCommand(Command, {
      args: { slug: 'test-doc' },
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'At least one field must be specified to update.'
    )
  })

  it('should handle daemon update failure', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonUpdateDoc.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'missing-doc' },
      flags: { title: 'New Title' },
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
      args: { slug: 'test-doc' },
      flags: { title: 'New Title' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonUpdateDoc.mockResolvedValue({
      success: true,
      doc: { title: 'Test', slug: 'test' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'test' },
      flags: { title: 'Test', project: 'other-project' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
