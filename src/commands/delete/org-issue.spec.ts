import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteOrgIssue = vi.fn()
const mockDaemonGetOrgIssueByDisplayNumber = vi.fn()

vi.mock('../../daemon/daemon-delete-org-issue.js', () => ({
  daemonDeleteOrgIssue: (...args: unknown[]) =>
    mockDaemonDeleteOrgIssue(...args),
}))

vi.mock('../../daemon/daemon-get-org-issue-by-display-number.js', () => ({
  daemonGetOrgIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetOrgIssueByDisplayNumber(...args),
}))

describe('DeleteOrgIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./org-issue.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./org-issue.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should delete org issue by display number', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-123',
      displayNumber: 1,
    })
    mockDaemonDeleteOrgIssue.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org', force: true },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      displayNumber: 1,
    })
    expect(mockDaemonDeleteOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      issueId: 'issue-uuid-123',
    })
    expect(
      cmd.logs.some(log => log.includes('Deleted organization issue'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
  })

  it('should delete org issue by display number with hash', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-456',
      displayNumber: 5,
    })
    mockDaemonDeleteOrgIssue.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '#5' },
      flags: { org: 'my-org', force: true },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      displayNumber: 5,
    })
    expect(mockDaemonDeleteOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      issueId: 'issue-uuid-456',
    })
  })

  it('should delete org issue by UUID directly', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonDeleteOrgIssue.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: 'abc-123-uuid' },
      flags: { org: 'centy-io', force: true },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).not.toHaveBeenCalled()
    expect(mockDaemonDeleteOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'centy-io',
      issueId: 'abc-123-uuid',
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonDeleteOrgIssue.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org', force: true, json: true },
    })
    await cmd.run()

    const output = JSON.parse(cmd.logs[0])
    expect(output.success).toBe(true)
    expect(output.issueId).toBe('issue-uuid')
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonDeleteOrgIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org', force: true },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle get issue by display number failure', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockRejectedValue(
      new Error('Issue not found')
    )

    const cmd = createMockCommand(Command, {
      args: { identifier: '999' },
      flags: { org: 'my-org', force: true },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
