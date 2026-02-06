import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetIssueByDisplayNumber = vi.fn()
const mockDaemonGetPrByDisplayNumber = vi.fn()
const mockDaemonUpdateIssue = vi.fn()
const mockDaemonUpdatePr = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-issue-by-display-number.js', () => ({
  daemonGetIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetIssueByDisplayNumber(...args),
}))

vi.mock('../daemon/daemon-get-pr-by-display-number.js', () => ({
  daemonGetPrByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetPrByDisplayNumber(...args),
}))

vi.mock('../daemon/daemon-update-issue.js', () => ({
  daemonUpdateIssue: (...args: unknown[]) => mockDaemonUpdateIssue(...args),
}))

vi.mock('../daemon/daemon-update-pr.js', () => ({
  daemonUpdatePr: (...args: unknown[]) => mockDaemonUpdatePr(...args),
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
    it('should close issue when only issue exists', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue({
        id: 'issue-uuid',
        displayNumber: 1,
      })
      mockDaemonGetPrByDisplayNumber.mockRejectedValue(new Error('Not found'))
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
          issueId: 'issue-uuid',
          status: 'closed',
        })
      )
      expect(cmd.logs[0]).toContain('Closed issue #1')
    })

    it('should close issue with # prefix', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue({
        id: 'issue-uuid',
        displayNumber: 5,
      })
      mockDaemonGetPrByDisplayNumber.mockRejectedValue(new Error('Not found'))
      mockDaemonUpdateIssue.mockResolvedValue({
        success: true,
        issue: { displayNumber: 5 },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '#5' },
      })

      await cmd.run()

      expect(mockDaemonGetIssueByDisplayNumber).toHaveBeenCalledWith(
        expect.objectContaining({ displayNumber: 5 })
      )
      expect(cmd.logs[0]).toContain('Closed issue #5')
    })

    it('should close issue with --type flag', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue({
        id: 'issue-uuid',
        displayNumber: 1,
      })
      mockDaemonUpdateIssue.mockResolvedValue({
        success: true,
        issue: { displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: { type: 'issue' },
        args: { identifier: '1' },
      })

      await cmd.run()

      expect(mockDaemonGetPrByDisplayNumber).not.toHaveBeenCalled()
      expect(mockDaemonUpdateIssue).toHaveBeenCalled()
    })
  })

  describe('closing PRs', () => {
    it('should close PR when only PR exists', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockRejectedValue(
        new Error('Not found')
      )
      mockDaemonGetPrByDisplayNumber.mockResolvedValue({
        id: 'pr-uuid',
        displayNumber: 1,
      })
      mockDaemonUpdatePr.mockResolvedValue({
        success: true,
        pr: { displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '1' },
      })

      await cmd.run()

      expect(mockDaemonUpdatePr).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/project',
          prId: 'pr-uuid',
          status: 'closed',
        })
      )
      expect(cmd.logs[0]).toContain('Closed PR #1')
    })

    it('should close PR with --type flag', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetPrByDisplayNumber.mockResolvedValue({
        id: 'pr-uuid',
        displayNumber: 1,
      })
      mockDaemonUpdatePr.mockResolvedValue({
        success: true,
        pr: { displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: { type: 'pr' },
        args: { identifier: '1' },
      })

      await cmd.run()

      expect(mockDaemonGetIssueByDisplayNumber).not.toHaveBeenCalled()
      expect(mockDaemonUpdatePr).toHaveBeenCalled()
    })
  })

  describe('ambiguity handling', () => {
    it('should error when both issue and PR exist', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue({
        id: 'issue-uuid',
        displayNumber: 1,
      })
      mockDaemonGetPrByDisplayNumber.mockResolvedValue({
        id: 'pr-uuid',
        displayNumber: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '1' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('Ambiguous')
      expect(cmd.errors[0]).toContain('--type')
    })
  })

  describe('error handling', () => {
    it('should error when no entity found', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockRejectedValue(
        new Error('Not found')
      )
      mockDaemonGetPrByDisplayNumber.mockRejectedValue(new Error('Not found'))

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { identifier: '999' },
      })

      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('No issue or PR found')
    })

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
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue({
        id: 'issue-uuid',
        displayNumber: 1,
      })
      mockDaemonGetPrByDisplayNumber.mockRejectedValue(new Error('Not found'))
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

    it('should output JSON for PR', async () => {
      const { default: Command } = await import('./close.js')
      mockDaemonGetIssueByDisplayNumber.mockRejectedValue(
        new Error('Not found')
      )
      mockDaemonGetPrByDisplayNumber.mockResolvedValue({
        id: 'pr-uuid',
        displayNumber: 1,
      })
      mockDaemonUpdatePr.mockResolvedValue({
        success: true,
        pr: { id: 'pr-uuid', displayNumber: 1 },
      })

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { identifier: '1' },
      })

      await cmd.run()

      const output = JSON.parse(cmd.logs[0])
      expect(output.type).toBe('pr')
      expect(output.displayNumber).toBe(1)
    })
  })

  describe('project flag', () => {
    it('should use project flag to resolve path', async () => {
      const { default: Command } = await import('./close.js')
      mockResolveProjectPath.mockResolvedValue('/other/project')
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue({
        id: 'issue-uuid',
        displayNumber: 1,
      })
      mockDaemonGetPrByDisplayNumber.mockRejectedValue(new Error('Not found'))
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
