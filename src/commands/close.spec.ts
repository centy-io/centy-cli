import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonUpdateIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-update-issue.js', () => ({
  daemonUpdateIssue: (...args: unknown[]) => mockDaemonUpdateIssue(...args),
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

  describe('closing issues', () => {
    it('should close issue by display number', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateIssue.mockResolvedValue({
        success: true,
        issue: { displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '1' },
      })

      await cmd.run()

      expect(mockDaemonUpdateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          issueId: '1',
          status: 'closed',
        })
      )
      expect(cmd.logs[0]).toContain('Closed issue #1')
    })

    it('should close issue with # prefix', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateIssue.mockResolvedValue({
        success: true,
        issue: { displayNumber: 5 },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '#5' },
      })

      await cmd.run()

      expect(cmd.logs[0]).toContain('Closed issue #5')
    })
  })

  describe('error handling', () => {
    it('should error on invalid identifier', async () => {
      const { default: Command } = await import('./close.js')

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: 'not-a-number' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('Invalid identifier')
    })

    it('should handle NotInitializedError', async () => {
      const { default: Command } = await import('./close.js')
      const { NotInitializedError } =
        await import('../utils/ensure-initialized.js')
      mockEnsureInitialized.mockRejectedValue(
        new NotInitializedError('Project not initialized')
      )

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors).toContain('Project not initialized')
    })
  })

  describe('JSON output', () => {
    it('should output JSON for issue', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonUpdateIssue.mockResolvedValue({
        success: true,
        issue: { id: 'issue-uuid', displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { identifier: '1' },
      })

      await cmd.run()

      const output = JSON.parse(cmd.logs[0])
      expect(output.type).toBe('issue')
      expect(output.displayNumber).toBe(1)
    })
  })

  describe('project flag', () => {
    it('should use project flag to resolve path', async () => {
      const { default: Command } = await import('./close.js')
      mockResolveProjectPath.mockResolvedValue('/other/project')
      mockDaemonUpdateIssue.mockResolvedValue({
        success: true,
        issue: { displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: { project: 'other-project' },
        args: { identifier: '1' },
      })

      await cmd.run()

      expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
      expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
    })
  })
})
