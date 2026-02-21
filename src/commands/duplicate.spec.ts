import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonDuplicateItem = vi.fn()
const mockDaemonGetItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-duplicate-item.js', () => ({
  daemonDuplicateItem: (...args: unknown[]) => mockDaemonDuplicateItem(...args),
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

describe('Duplicate command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./duplicate.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./duplicate.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('duplicating items', () => {
    it('should duplicate item by display number', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonDuplicateItem.mockResolvedValue({
        success: true,
        item: {
          id: 'new-item-uuid',
          title: 'Copy',
          metadata: { displayNumber: 2 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      expect(mockDaemonDuplicateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceProjectPath: '/test/project',
          itemType: 'issues',
          itemId: 'item-uuid',
        })
      )
      expect(cmd.logs[0]).toContain('Duplicated issue')
    })

    it('should duplicate item by UUID (no GetItem call)', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockDaemonDuplicateItem.mockResolvedValue({
        success: true,
        item: {
          id: 'new-item-uuid',
          title: 'Copy',
          metadata: { displayNumber: 2 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockDaemonGetItem).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./duplicate.js')
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
      expect(cmd.errors).toContain('Source project: Project not initialized')
    })

    it('should handle daemon duplicate error', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })
      mockDaemonDuplicateItem.mockResolvedValue({
        success: false,
        error: 'Duplicate failed',
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Duplicate failed')
    })
  })
})
