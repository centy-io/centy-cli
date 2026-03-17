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

describe('Next command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./next.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./next.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('getting next item', () => {
    it('should return the next open item with display number, title, status, and priority', async () => {
      const { default: Command } = await import('./next.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [
          {
            id: 'item-1',
            title: 'Fix critical bug',
            body: 'This is a critical bug that needs fixing.',
            metadata: { displayNumber: 42, status: 'open', priority: 1 },
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
          filter: JSON.stringify({ status: { $eq: 'open' } }),
          limit: 1,
          offset: 0,
        })
      )
      const output = cmd.logs.join('\n')
      expect(output).toContain('#42')
      expect(output).toContain('Fix critical bug')
      expect(output).toContain('[open]')
      expect(output).toContain('[P1]')
    })

    it('should default to --status open', async () => {
      const { default: Command } = await import('./next.js')
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

      expect(mockDaemonListItems).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: JSON.stringify({ status: { $eq: 'open' } }),
        })
      )
    })

    it('should use provided --status flag', async () => {
      const { default: Command } = await import('./next.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'in-progress' },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockDaemonListItems).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: JSON.stringify({ status: { $eq: 'in-progress' } }),
        })
      )
    })

    it('should show "No <status> <type> found." when empty', async () => {
      const { default: Command } = await import('./next.js')
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

      expect(cmd.logs[0]).toBe('No open issue found.')
    })

    it('should show correct empty message with custom status', async () => {
      const { default: Command } = await import('./next.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: { status: 'in-progress' },
        args: { type: 'bug' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toBe('No in-progress bug found.')
    })

    it('should pluralize type for daemon call', async () => {
      const { default: Command } = await import('./next.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [],
        totalCount: 0,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'bug' },
      })

      await cmd.run()

      expect(mockDaemonListItems).toHaveBeenCalledWith(
        expect.objectContaining({ itemType: 'bugs' })
      )
    })

    it('should output body when present', async () => {
      const { default: Command } = await import('./next.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [
          {
            id: 'item-1',
            title: 'My issue',
            body: 'Detailed description here.',
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

      expect(cmd.logs.join('\n')).toContain('Detailed description here.')
    })

    it('should handle item without metadata', async () => {
      const { default: Command } = await import('./next.js')
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [
          {
            id: 'item-1',
            title: 'No meta item',
            body: '',
            metadata: undefined,
          },
        ],
        totalCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('No meta item')
    })
  })

  describe('JSON output', () => {
    it('should output JSON when --json flag is set', async () => {
      const { default: Command } = await import('./next.js')
      const item = {
        id: 'item-1',
        title: 'My issue',
        body: 'body text',
        metadata: { displayNumber: 1, status: 'open', priority: 1 },
      }
      mockDaemonListItems.mockResolvedValue({
        success: true,
        items: [item],
        totalCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { type: 'issue' },
      })

      await cmd.run()

      const output = JSON.parse(cmd.logs[0])
      expect(output).toMatchObject({ id: 'item-1', title: 'My issue' })
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./next.js')
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

    it('should re-throw non-NotInitializedError', async () => {
      const { default: Command } = await import('./next.js')
      mockEnsureInitialized.mockRejectedValue(new Error('Generic error'))

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon error', async () => {
      const { default: Command } = await import('./next.js')
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
})
