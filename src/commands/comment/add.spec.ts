import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-create-item.js', () => ({
  daemonCreateItem: (...args: unknown[]) => mockDaemonCreateItem(...args),
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

describe('CommentAdd command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./add.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./add.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('adding a comment', () => {
    it('should create a comment with item_id custom field', async () => {
      const { default: Command } = await import('./add.js')
      mockDaemonCreateItem.mockResolvedValue({
        success: true,
        item: { id: 'comment-uuid', body: 'This looks good', customFields: {} },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid', body: 'This looks good' },
      })

      await cmd.run()

      expect(mockDaemonCreateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'comments',
          body: 'This looks good',
          customFields: expect.objectContaining({ item_id: 'parent-uuid' }),
        })
      )
      expect(cmd.logs[0]).toContain('Added comment on parent-uuid')
      expect(cmd.logs[1]).toContain('comment-uuid')
    })

    it('should include author in custom fields when provided', async () => {
      const { default: Command } = await import('./add.js')
      mockDaemonCreateItem.mockResolvedValue({
        success: true,
        item: { id: 'comment-uuid', body: 'Nice work', customFields: {} },
      })

      const cmd = createMockCommand(Command, {
        flags: { author: 'alice' },
        args: { itemId: 'parent-uuid', body: 'Nice work' },
      })

      await cmd.run()

      expect(mockDaemonCreateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          customFields: expect.objectContaining({
            item_id: 'parent-uuid',
            author: 'alice',
          }),
        })
      )
    })

    it('should not include author in custom fields when not provided', async () => {
      const { default: Command } = await import('./add.js')
      mockDaemonCreateItem.mockResolvedValue({
        success: true,
        item: { id: 'comment-uuid', body: 'Test', customFields: {} },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid', body: 'Test' },
      })

      await cmd.run()

      const call = mockDaemonCreateItem.mock.calls[0][0]
      expect(call.customFields).not.toHaveProperty('author')
    })
  })

  describe('--json flag', () => {
    it('should output JSON when --json is set', async () => {
      const { default: Command } = await import('./add.js')
      mockDaemonCreateItem.mockResolvedValue({
        success: true,
        item: { id: 'comment-uuid', body: 'Test', customFields: {} },
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true, author: 'bob' },
        args: { itemId: 'parent-uuid', body: 'Test' },
      })

      await cmd.run()

      expect(cmd.logs).toHaveLength(1)
      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed).toMatchObject({
        id: 'comment-uuid',
        body: 'Test',
        itemId: 'parent-uuid',
        author: 'bob',
      })
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./add.js')
      const { NotInitializedError } =
        await import('../../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid', body: 'Test' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should handle daemon create error', async () => {
      const { default: Command } = await import('./add.js')
      mockDaemonCreateItem.mockResolvedValue({
        success: false,
        error: 'Create failed',
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid', body: 'Test' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Create failed')
    })
  })
})
