import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockRlQuestion = vi.fn()
const mockRlClose = vi.fn()

vi.mock('../../daemon/daemon-delete-item.js', () => ({
  daemonDeleteItem: (...args: unknown[]) => mockDaemonDeleteItem(...args),
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

vi.mock('node:readline', () => ({
  createInterface: vi.fn(() => ({
    question: (...args: unknown[]) => mockRlQuestion(...args),
    close: (...args: unknown[]) => mockRlClose(...args),
  })),
}))

describe('CommentDelete command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./delete.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./delete.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('deleting with --force', () => {
    it('should delete comment with force flag', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { commentId: 'comment-uuid' },
      })

      await cmd.run()

      expect(mockDaemonDeleteItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'comments',
          itemId: 'comment-uuid',
        })
      )
      expect(cmd.logs[0]).toContain('Deleted comment comment-uuid')
    })
  })

  describe('--json flag', () => {
    it('should output JSON and skip confirmation when --json is set', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: false, json: true },
        args: { commentId: 'comment-uuid' },
      })

      await cmd.run()

      expect(mockRlQuestion).not.toHaveBeenCalled()
      expect(mockDaemonDeleteItem).toHaveBeenCalled()
      expect(cmd.logs).toHaveLength(1)
      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed).toMatchObject({
        id: 'comment-uuid',
        deleted: true,
      })
    })
  })

  describe('confirmation prompt (no --force)', () => {
    it('should cancel when user answers N', async () => {
      const { default: Command } = await import('./delete.js')
      mockRlQuestion.mockImplementation(
        (_q: unknown, cb: (a: string) => void) => cb('N')
      )

      const cmd = createMockCommand(Command, {
        flags: { force: false },
        args: { commentId: 'comment-uuid' },
      })

      await cmd.run()

      expect(mockDaemonDeleteItem).not.toHaveBeenCalled()
      expect(cmd.logs[0]).toContain('Cancelled')
    })

    it('should proceed when user answers y', async () => {
      const { default: Command } = await import('./delete.js')
      mockRlQuestion.mockImplementation(
        (_q: unknown, cb: (a: string) => void) => cb('y')
      )
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: false },
        args: { commentId: 'comment-uuid' },
      })

      await cmd.run()

      expect(mockDaemonDeleteItem).toHaveBeenCalled()
      expect(cmd.logs[0]).toContain('Deleted comment comment-uuid')
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./delete.js')
      const { NotInitializedError } =
        await import('../../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { commentId: 'comment-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should handle daemon delete error', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonDeleteItem.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { commentId: 'comment-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Delete failed')
    })
  })
})
