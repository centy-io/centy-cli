import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonUpdateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockResolveItemId = vi.fn()

vi.mock('../daemon/daemon-update-item.js', () => ({
  daemonUpdateItem: (...args: unknown[]) => mockDaemonUpdateItem(...args),
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

describe('Update command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
    mockResolveItemId.mockResolvedValue('item-uuid')
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
    it('should update item status', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'closed' },
        args: { type: 'issue', id: 'item-uuid' },
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

    it('should show item UUID when metadata has no displayNumber', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: undefined },
      })

      const cmd = createMockCommand(Command, {
        flags: { title: 'New title' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('item-uuid')
    })

    it('should output JSON when --json flag is set', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: {
          id: 'item-uuid',
          title: 'My Issue',
          metadata: { displayNumber: 1, status: 'closed' },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'closed', json: true },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(cmd.logs).toHaveLength(1)
      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed).toMatchObject({
        type: 'issue',
        id: 'item-uuid',
        displayNumber: 1,
        title: 'My Issue',
        status: 'closed',
      })
    })

    it('should omit displayNumber from JSON when item has no display number', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: {
          id: 'doc-slug',
          title: 'My Doc',
          metadata: { displayNumber: 0, status: '' },
        },
      })

      const cmd = createMockCommand(Command, {
        flags: { title: 'My Doc', json: true },
        args: { type: 'doc', id: 'doc-slug' },
      })

      await cmd.run()

      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed.displayNumber).toBeUndefined()
      expect(parsed.type).toBe('doc')
    })

    it('should use project flag to resolve path', async () => {
      const { default: Command } = await import('./update.js')
      mockResolveProjectPath.mockResolvedValue('/other/project')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'open', project: 'other-project' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      await cmd.run()

      expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
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

    it('should re-throw non-NotInitializedError', async () => {
      const { default: Command } = await import('./update.js')
      mockEnsureInitialized.mockRejectedValue(new Error('Generic error'))

      const cmd = createMockCommand(Command, {
        flags: { status: 'closed' },
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon update error', async () => {
      const { default: Command } = await import('./update.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: false,
        error: 'Update failed',
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'open' },
        args: { type: 'issue', id: 'item-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Update failed')
    })
  })
})
