import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonDeleteItem = vi.fn()
const mockDaemonGetItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-delete-item.js', () => ({
  daemonDeleteItem: (...args: unknown[]) => mockDaemonDeleteItem(...args),
}))

vi.mock('../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
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

describe('Delete command', () => {
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

  describe('deleting items with --force', () => {
    it('should delete item by display number with force flag', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: '1' },
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

    it('should delete item by UUID with force flag', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonDeleteItem.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonGetItem).not.toHaveBeenCalled()
      expect(mockDaemonDeleteItem).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: 'item-uuid' })
      )
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

    it('should handle daemon delete error', async () => {
      const { default: Command } = await import('./delete.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonDeleteItem.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { force: true },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Delete failed')
    })
  })
})
