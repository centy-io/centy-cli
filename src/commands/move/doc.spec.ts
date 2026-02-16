import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonMoveDoc = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-move-doc.js', () => ({
  daemonMoveDoc: (...args: unknown[]) => mockDaemonMoveDoc(...args),
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

describe('MoveDoc command', () => {
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

  it('should move doc to different project', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveDoc.mockResolvedValue({
      success: true,
      oldSlug: 'my-doc',
      doc: { slug: 'my-doc' },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockDaemonMoveDoc).toHaveBeenCalledWith({
      sourceProjectPath: '/source/project',
      slug: 'my-doc',
      targetProjectPath: '/target/project',
      newSlug: '',
    })
    expect(cmd.logs.some(log => log.includes('Moved doc'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('/target/project'))).toBe(true)
  })

  it('should move doc with new slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveDoc.mockResolvedValue({
      success: true,
      oldSlug: 'old-slug',
      doc: { slug: 'new-slug' },
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project', 'new-slug': 'new-slug' },
      args: { slug: 'old-slug' },
    })

    await cmd.run()

    expect(mockDaemonMoveDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        newSlug: 'new-slug',
      })
    )
    expect(cmd.logs.some(log => log.includes('old-slug → new-slug'))).toBe(true)
  })

  it('should handle NotInitializedError on source project', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Source project'))).toBe(true)
  })

  it('should handle NotInitializedError on target project', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized
      .mockResolvedValueOnce('/source/project/.centy')
      .mockRejectedValueOnce(new NotInitializedError('Project not initialized'))

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Target project'))).toBe(true)
  })

  it('should error when source and target are the same', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/same/project')

    const cmd = createMockCommand(Command, {
      flags: { to: '/same/project' },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('cannot be the same'))).toBe(true)
  })

  it('should handle daemon move failure', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveDoc.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should handle non-Error throws in source ensureInitialized', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should handle non-Error throws in target ensureInitialized', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized
      .mockResolvedValueOnce('/source/project/.centy')
      .mockRejectedValueOnce('string error')

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
