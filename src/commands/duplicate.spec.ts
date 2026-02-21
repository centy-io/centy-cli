import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonDuplicateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockResolveItemId = vi.fn()

vi.mock('../daemon/daemon-duplicate-item.js', () => ({
  daemonDuplicateItem: (...args: unknown[]) => mockDaemonDuplicateItem(...args),
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

describe('Duplicate command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
    mockResolveItemId.mockResolvedValue('item-uuid')
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
    it('should duplicate item within same project', async () => {
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

      expect(mockDaemonDuplicateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceProjectPath: '/test/project',
          targetProjectPath: '/test/project',
          itemType: 'issues',
          itemId: 'item-uuid',
        })
      )
      expect(cmd.logs[0]).toContain('Duplicated issue')
      expect(cmd.logs[0]).not.toContain(' in ')
    })

    it('should duplicate item to a different target project', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockResolveProjectPath.mockImplementation((p: unknown) =>
        p === '/other/project' ? '/other/project' : '/test/project'
      )
      mockDaemonDuplicateItem.mockResolvedValue({
        success: true,
        item: {
          id: 'new-item-uuid',
          title: 'Copy',
          metadata: { displayNumber: 2 },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other/project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain(' in /other/project')
    })

    it('should output item ID when no displayNumber in metadata', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockDaemonDuplicateItem.mockResolvedValue({
        success: true,
        item: { id: 'new-item-uuid', title: 'Copy', metadata: undefined },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('new-item-uuid')
    })
  })

  describe('error handling', () => {
    it('should handle source NotInitializedError', async () => {
      const { default: Command } = await import('./duplicate.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Source project: Project not initialized')
    })

    it('should handle target NotInitializedError when --to is different', async () => {
      const { default: Command } = await import('./duplicate.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockResolveProjectPath.mockImplementation((p: unknown) =>
        p === '/other' ? '/other' : '/test/project'
      )
      mockEnsureInitialized.mockImplementation(async (path: unknown) => {
        if (path === '/other') {
          throw new NotInitializedError('Target not initialized')
        }
      })

      const cmd = createMockCommand(Command, {
        flags: { to: '/other' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Target project: Target not initialized')
    })

    it('should re-throw non-NotInitializedError', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockEnsureInitialized.mockRejectedValue(new Error('Generic error'))

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon duplicate error', async () => {
      const { default: Command } = await import('./duplicate.js')
      mockDaemonDuplicateItem.mockResolvedValue({
        success: false,
        error: 'Duplicate failed',
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Duplicate failed')
    })
  })
})
