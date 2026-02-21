import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonMoveItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockResolveItemId = vi.fn()

vi.mock('../daemon/daemon-move-item.js', () => ({
  daemonMoveItem: (...args: unknown[]) => mockDaemonMoveItem(...args),
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

describe('Move command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockImplementation((p: unknown) =>
      p === undefined ? '/test/project' : '/other/project'
    )
    mockEnsureInitialized.mockResolvedValue(undefined)
    mockResolveItemId.mockResolvedValue('item-uuid')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./move.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./move.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('moving items', () => {
    it('should move item to target project', async () => {
      const { default: Command } = await import('./move.js')
      mockDaemonMoveItem.mockResolvedValue({
        success: true,
        item: {
          id: 'moved-uuid',
          title: 'Moved item',
          metadata: { displayNumber: 1 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonMoveItem).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceProjectPath: '/test/project',
          targetProjectPath: '/other/project',
          itemType: 'issues',
          itemId: 'item-uuid',
        })
      )
      expect(cmd.logs[0]).toContain('Moved issue')
      expect(cmd.logs[0]).toContain('/other/project')
    })

    it('should show item ID when metadata has no displayNumber', async () => {
      const { default: Command } = await import('./move.js')
      mockDaemonMoveItem.mockResolvedValue({
        success: true,
        item: { id: 'moved-uuid', title: 'Moved item', metadata: undefined },
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('moved-uuid')
    })
  })

  describe('error handling', () => {
    it('should error when source and target are the same', async () => {
      const { default: Command } = await import('./move.js')
      mockResolveProjectPath.mockResolvedValue('/test/project')

      const cmd = createMockCommand(Command, {
        flags: { to: '/test/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('same')
    })

    it('should handle source NotInitializedError', async () => {
      const { default: Command } = await import('./move.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Source not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Source project: Source not initialized')
    })

    it('should handle target NotInitializedError', async () => {
      const { default: Command } = await import('./move.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      let callCount = 0
      mockEnsureInitialized.mockImplementation(async () => {
        callCount++
        if (callCount === 2) {
          throw new NotInitializedError('Target not initialized')
        }
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Target project: Target not initialized')
    })

    it('should re-throw non-NotInitializedError from source', async () => {
      const { default: Command } = await import('./move.js')
      mockEnsureInitialized.mockRejectedValue(new Error('Generic source error'))

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should re-throw non-NotInitializedError from target', async () => {
      const { default: Command } = await import('./move.js')
      let callCount = 0
      mockEnsureInitialized.mockImplementation(async () => {
        callCount++
        if (callCount === 2) {
          throw new Error('Generic target error')
        }
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon move error', async () => {
      const { default: Command } = await import('./move.js')
      mockDaemonMoveItem.mockResolvedValue({
        success: false,
        error: 'Move failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Move failed')
    })
  })
})
