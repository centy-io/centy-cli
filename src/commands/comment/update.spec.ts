import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-update-item.js', () => ({
  daemonUpdateItem: (...args: unknown[]) => mockDaemonUpdateItem(...args),
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

describe('CommentUpdate command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./update.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./update.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('updating a comment', () => {
    it('should update comment body', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'comment-uuid', body: 'Updated text' },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { commentId: 'comment-uuid', body: 'Updated text' },
      })

      await cmd.run()

      expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'comments',
          itemId: 'comment-uuid',
          body: 'Updated text',
        })
      )
      expect(cmd.logs[0]).toContain('Updated comment comment-uuid')
    })
  })

  describe('--json flag', () => {
    it('should output JSON when --json is set', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'comment-uuid', body: 'Updated text' },
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { commentId: 'comment-uuid', body: 'Updated text' },
      })

      await cmd.run()

      expect(cmd.logs).toHaveLength(1)
      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed).toMatchObject({
        id: 'comment-uuid',
        body: 'Updated text',
      })
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./update.js')
      const { NotInitializedError } =
        await import('../../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { commentId: 'comment-uuid', body: 'Test' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should handle daemon update error', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: false,
        error: 'Update failed',
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { commentId: 'comment-uuid', body: 'Test' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Update failed')
    })
  })
})
