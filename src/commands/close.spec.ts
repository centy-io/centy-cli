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

describe('Close command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
    mockResolveItemId.mockResolvedValue('issue-uuid')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./close.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./close.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('closing items', () => {
    it('should close issue and show display number', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          itemType: 'issues',
          itemId: 'issue-uuid',
          status: 'closed',
        })
      )
      expect(cmd.logs[0]).toContain('Closed issue')
      expect(cmd.logs[0]).toContain('#1')
    })

    it('should close item and show item ID when no displayNumber', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: undefined },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'issue-uuid' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('issue-uuid')
    })

    it('should close epic and show display number', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'epic-uuid', metadata: { displayNumber: 3 } },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'epic', id: '3' },
      })

      await cmd.run()

      expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          itemType: 'epics',
          status: 'closed',
        })
      )
      expect(cmd.logs[0]).toContain('Closed epic')
    })
  })

  describe('error handling', () => {
    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./close.js')
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
      expect(cmd.errors).toContain('Project not initialized')
    })

    it('should re-throw non-NotInitializedError', async () => {
      const { default: Command } = await import('./close.js')
      mockEnsureInitialized.mockRejectedValue(new Error('Generic error'))

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
    })

    it('should handle daemon update error', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: false,
        error: 'Update failed',
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Update failed')
    })
  })

  describe('JSON output', () => {
    it('should output JSON with displayNumber', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      const output = JSON.parse(cmd.logs[0])
      expect(output.type).toBe('issue')
      expect(output.status).toBe('closed')
      expect(output.displayNumber).toBe(1)
    })

    it('should output JSON without displayNumber when metadata is undefined', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: undefined },
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { type: 'issue', id: 'issue-uuid' },
      })

      await cmd.run()

      const output = JSON.parse(cmd.logs[0])
      expect(output.displayNumber).toBeUndefined()
    })
  })

  describe('project flag', () => {
    it('should use project flag to resolve path', async () => {
      const { default: Command } = await import('./close.js')
      mockResolveProjectPath.mockResolvedValue('/other/project')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: { project: 'other-project' },
        args: { type: 'issue', id: '1' },
      })

      await cmd.run()

      expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
      expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
    })
  })
})
