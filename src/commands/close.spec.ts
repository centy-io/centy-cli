import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetItem = vi.fn()
const mockDaemonUpdateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

vi.mock('../daemon/daemon-update-item.js', () => ({
  daemonUpdateItem: (...args: unknown[]) => mockDaemonUpdateItem(...args),
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
    it('should close issue by display number', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })
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
    })

    it('should close epic by display number', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'epic-uuid', metadata: { displayNumber: 3 } },
      })
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

    it('should close issue by UUID (no GetItem call)', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue', id: 'issue-uuid' },
      })

      await cmd.run()

      expect(mockDaemonGetItem).not.toHaveBeenCalled()
      expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 'issue-uuid',
          status: 'closed',
        })
      )
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

    it('should handle daemon update error', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })
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
    it('should output JSON', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })
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
    })
  })

  describe('project flag', () => {
    it('should use project flag to resolve path', async () => {
      const { default: Command } = await import('./close.js')
      mockResolveProjectPath.mockResolvedValue('/other/project')
      mockDaemonGetItem.mockResolvedValue({
        success: true,
        item: { id: 'issue-uuid', metadata: { displayNumber: 1 } },
      })
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
