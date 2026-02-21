import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonDeleteItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockResolveItemId = vi.fn()
const mockRlQuestion = vi.fn()
const mockRlClose = vi.fn()

vi.mock('../daemon/daemon-delete-item.js', () => ({
  daemonDeleteItem: (...args: unknown[]) => mockDaemonDeleteItem(...args),
}))

vi.mock('../lib/resolve-item-id/resolve-item-id.js', () => ({
  resolveItemId: (...args: unknown[]) => mockResolveItemId(...args),
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../utils/ensure-initialized.js', () => ({
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

describe('Delete command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
    mockResolveItemId.mockResolvedValue('item-uuid')
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

  describe('deleting items with --force', () => {
    it('should delete item with force flag', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonDeleteItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'issues',
          itemId: 'item-uuid',
        })
      )
      expect(cmd.logs[0]).toContain('Deleted issue')
    })

    it('should use resolveItemId to resolve the item UUID', async () => {
      const { default: Command } = await import('./delete.js')
      mockResolveItemId.mockResolvedValue('resolved-uuid')
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      expect(mockResolveItemId).toHaveBeenCalledWith(
        '1',
        'issues',
        '/test/project',
        expect.any(Function)
      )
      expect(mockDaemonDeleteItem).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: 'resolved-uuid' })
      )
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
        args: { type: 'issue', id: 'item-uuid' },
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
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonDeleteItem).toHaveBeenCalled()
      expect(cmd.logs[0]).toContain('Deleted issue')
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./delete.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should re-throw non-NotInitializedError errors', async () => {
      const { default: Command } = await import('./delete.js')
      const genericError = new Error('Generic error')
      mockEnsureInitialized.mockRejectedValue(genericError)

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon delete error', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonDeleteItem.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Delete failed')
    })
  })
})
