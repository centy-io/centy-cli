import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonListItems = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-list-items.js', () => ({
  daemonListItems: (...args: unknown[]) => mockDaemonListItems(...args),
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

describe('List command', () => {
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

  describe('listing items', () => {
    it('should list items of a given type', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [
          {
            id: 'item-1',
            title: 'First item',
            metadata: { displayNumber: 1, status: 'open', priority: 0 },
          },
        ],
        totalCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockDaemonListItems).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'issues',
        })
      )
      expect(cmd.logs[0]).toContain('1')
    })

    it('should show message when no items found', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('No')
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./list.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should handle daemon error', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: false,
        error: 'List failed',
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('List failed')
    })
  })

  describe('JSON output', () => {
    it('should output JSON when flag set', async () => {
      const { default: Command } = await import('./list.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [{ id: 'item-1', title: 'First item', metadata: {} }],
        totalCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { type: 'issue' },
      })

      await cmd.run()

      const output = JSON.parse(cmd.logs[0])
      expect(Array.isArray(output)).toBe(true)
    })
  })
})
