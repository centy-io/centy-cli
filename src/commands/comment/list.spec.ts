import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListItems = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-items.js', () => ({
  daemonListItems: (...args: unknown[]) => mockDaemonListItems(...args),
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

describe('CommentList command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('listing comments', () => {
    it('should filter by item_id using customFields filter', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid' },
      })

      await cmd.run()

      expect(mockDaemonListItems).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'comments',
          filter: JSON.stringify({
            customFields: { item_id: 'parent-uuid' },
          }),
        })
      )
    })

    it('should show "No comments found" when empty', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('No comments found')
    })

    it('should list comments with author and body', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [
          {
            id: 'comment-uuid-1',
            body: 'First comment',
            metadata: {
              customFields: { item_id: 'parent-uuid', author: 'alice' },
            },
          },
          {
            id: 'comment-uuid-2',
            body: 'Second comment',
            metadata: { customFields: { item_id: 'parent-uuid' } },
          },
        ],
        totalCount: 2,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('2 comment(s)')
      expect(cmd.logs[1]).toContain('comment-uuid-1')
      expect(cmd.logs[1]).toContain('[alice]')
      expect(cmd.logs[2]).toContain('First comment')
      expect(cmd.logs[3]).toContain('comment-uuid-2')
    })
  })

  describe('--json flag', () => {
    it('should output JSON when --json is set', async () => {
      const { default: Command } = await import('./list.js')
      const items = [
        {
          id: 'comment-uuid-1',
          body: 'Test',
          metadata: { customFields: { item_id: 'parent-uuid' } },
        },
      ]
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items,
        totalCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { itemId: 'parent-uuid' },
      })

      await cmd.run()

      expect(cmd.logs).toHaveLength(1)
      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed).toEqual(items)
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./list.js')
      const { NotInitializedError } =
        await import('../../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should handle daemon list error', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: false,
        error: 'List failed',
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { itemId: 'parent-uuid' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('List failed')
    })
  })
})
