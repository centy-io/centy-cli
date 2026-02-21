import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonRestoreItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockResolveItemId = vi.fn()

vi.mock('../daemon/daemon-restore-item.js', () => ({
  daemonRestoreItem: (...args: unknown[]) => mockDaemonRestoreItem(...args),
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

describe('Restore command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
    mockResolveItemId.mockResolvedValue('item-uuid')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./restore.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./restore.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('restoring items', () => {
    it('should restore item and log display number', async () => {
      const { default: Command } = await import('./restore.js')
      mockDaemonRestoreItem.mockResolvedValue({
        success: true,
        item: {
          id: 'item-uuid',
          metadata: { displayNumber: 3 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '3' },
      })

      await cmd.run()

      expect(mockDaemonRestoreItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'issues',
          itemId: 'item-uuid',
        })
      )
      expect(cmd.logs[0]).toContain('Restored issue')
      expect(cmd.logs[0]).toContain('#3')
    })

    it('should use resolveItemId to resolve the item UUID', async () => {
      const { default: Command } = await import('./restore.js')
      mockResolveItemId.mockResolvedValue('resolved-uuid')
      mockDaemonRestoreItem.mockResolvedValue({
        success: true,
        item: {
          id: 'resolved-uuid',
          metadata: { displayNumber: 1 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      expect(mockResolveItemId).toHaveBeenCalledWith(
        '1',
        'issues',
        '/test/project',
        expect.any(Function)
      )
      expect(mockDaemonRestoreItem).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: 'resolved-uuid' })
      )
    })

    it('should output item ID when metadata is undefined', async () => {
      const { default: Command } = await import('./restore.js')
      mockDaemonRestoreItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: undefined },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('item-uuid')
    })

    it('should output item ID when displayNumber is 0', async () => {
      const { default: Command } = await import('./restore.js')
      mockDaemonRestoreItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 0 } },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('item-uuid')
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./restore.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should re-throw non-NotInitializedError errors', async () => {
      const { default: Command } = await import('./restore.js')
      const genericError = new Error('Generic error')
      mockEnsureInitialized.mockRejectedValue(genericError)

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon restore error', async () => {
      const { default: Command } = await import('./restore.js')
      mockDaemonRestoreItem.mockResolvedValue({
        success: false,
        error: 'Restore failed',
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Restore failed')
    })
  })
})
