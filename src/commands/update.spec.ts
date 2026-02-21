import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetItem = vi.fn()
const mockDaemonUpdateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

vi.mock('../daemon/daemon-update-item.js', () => ({
  daemonUpdateItem: (...args: unknown[]) => mockDaemonUpdateItem(...args),
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

describe('Update command', () => {
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

  describe('updating items', () => {
    it('should update item by display number', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'closed' },
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'issues',
          itemId: 'item-uuid',
          status: 'closed',
        })
      )
      expect(cmd.logs[0]).toContain('Updated issue')
    })

    it('should update item by UUID (no GetItem call)', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: { title: 'New title' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonGetItem).not.toHaveBeenCalled()
      expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: 'item-uuid', title: 'New title' })
      )
    })
  })

  describe('error handling', () => {
    it('should error when no fields specified', async () => {
      const { default: Command } = await import('./update.js')

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('At least one field')
    })

    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./update.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: { status: 'closed' },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should handle daemon update error', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonUpdateItem.mockResolvedValue({
        success: false,
        error: 'Update failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'open' },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Update failed')
    })
  })
})
