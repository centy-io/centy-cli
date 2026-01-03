import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDuplicateDoc = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-duplicate-doc.js', () => ({
  daemonDuplicateDoc: (...args: unknown[]) => mockDaemonDuplicateDoc(...args),
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

describe('DuplicateDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./doc.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./doc.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should duplicate doc in same project', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'my-doc-copy', title: 'Copy of My Doc' },
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'my-doc' },
    })
    await cmd.run()

    expect(mockDaemonDuplicateDoc).toHaveBeenCalledWith({
      sourceProjectPath: '/test/project',
      slug: 'my-doc',
      targetProjectPath: '/test/project',
      newSlug: undefined,
      newTitle: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Duplicated doc'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('my-doc-copy'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('in current project'))).toBe(true)
  })

  it('should duplicate doc with new slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'readme-v2', title: 'Copy of Readme' },
    })

    const cmd = createMockCommand(Command, {
      flags: { 'new-slug': 'readme-v2' },
      args: { slug: 'readme' },
    })
    await cmd.run()

    expect(mockDaemonDuplicateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        newSlug: 'readme-v2',
      })
    )
    expect(cmd.logs.some(log => log.includes('readme-v2'))).toBe(true)
  })

  it('should duplicate doc with new title', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'spec-copy', title: 'Spec Copy' },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Spec Copy' },
      args: { slug: 'spec' },
    })
    await cmd.run()

    expect(mockDaemonDuplicateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        newTitle: 'Spec Copy',
      })
    )
  })

  it('should duplicate doc to different project', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockImplementation(path => {
      if (path === '/other/project') return Promise.resolve('/other/project')
      return Promise.resolve('/test/project')
    })
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'api-guide-copy', title: 'Copy of API Guide' },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/other/project' },
      args: { slug: 'api-guide' },
    })
    await cmd.run()

    expect(mockDaemonDuplicateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceProjectPath: '/test/project',
        targetProjectPath: '/other/project',
      })
    )
    expect(cmd.logs.some(log => log.includes('in /other/project'))).toBe(true)
  })

  it('should handle daemon duplicate failure', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'nonexistent' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should handle source NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'test' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Source project: Project not initialized')
  })

  it('should handle target NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')

    let callCount = 0
    mockEnsureInitialized.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.resolve()
      throw new NotInitializedError('Target not initialized')
    })
    mockResolveProjectPath.mockImplementation(path => {
      if (path === '/other/project') return Promise.resolve('/other/project')
      return Promise.resolve('/test/project')
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/other/project' },
      args: { slug: 'test' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Target project: Target not initialized')
  })

  it('should handle other errors during source initialization', async () => {
    const { default: Command } = await import('./doc.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'test' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should handle other errors during target initialization', async () => {
    const { default: Command } = await import('./doc.js')

    let callCount = 0
    mockEnsureInitialized.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.resolve()
      throw new Error('Unknown target error')
    })
    mockResolveProjectPath.mockImplementation(path => {
      if (path === '/other/project') return Promise.resolve('/other/project')
      return Promise.resolve('/test/project')
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/other/project' },
      args: { slug: 'test' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should use project flag to resolve source path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/custom/project')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'doc-copy', title: 'Copy' },
    })

    const cmd = createMockCommand(Command, {
      flags: { project: 'custom-project' },
      args: { slug: 'doc' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('custom-project')
  })
})
