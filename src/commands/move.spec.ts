import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonMoveItem = vi.fn()
const mockDaemonGetItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-move-item.js', () => ({
  daemonMoveItem: (...args: unknown[]) => mockDaemonMoveItem(...args),
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

describe('Move command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockImplementation((p: unknown) =>
      p === 'other-project' ? '/other/project' : '/test/project'
    )
    mockEnsureInitialized.mockResolvedValue(undefined)
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
    it('should move item by display number to target project', async () => {
      const { default: Command } = await import('./move.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonMoveItem.mockResolvedValue({
        success: true,
        item: {
          id: 'moved-item-uuid',
          title: 'Moved item',
          metadata: { displayNumber: 1 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: { to: 'other-project' },
        args: { type: 'issue', id: '1' },
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
    })

    it('should move item by UUID (no GetItem call)', async () => {
      const { default: Command } = await import('./move.js')
      mockDaemonMoveItem.mockResolvedValue({
        success: true,
        item: {
          id: 'moved-item-uuid',
          title: 'Moved item',
          metadata: { displayNumber: 1 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: { to: 'other-project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonGetItem).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should error when source and target are the same', async () => {
      const { default: Command } = await import('./move.js')
      mockResolveProjectPath.mockResolvedValue('/test/project')

      const cmd = createMockCommand(Command, {
        flags: { to: '/test/project' },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('same')
    })

    it('should handle daemon move error', async () => {
      const { default: Command } = await import('./move.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonMoveItem.mockResolvedValue({
        success: false,
        error: 'Move failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { to: 'other-project' },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Move failed')
    })
  })
})
