import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetOrgIssueByDisplayNumber = vi.fn()
const mockDaemonUpdateOrgIssue = vi.fn()

vi.mock('../../daemon/daemon-get-org-issue-by-display-number.js', () => ({
  daemonGetOrgIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetOrgIssueByDisplayNumber(...args),
}))

vi.mock('../../daemon/daemon-update-org-issue.js', () => ({
  daemonUpdateOrgIssue: (...args: unknown[]) =>
    mockDaemonUpdateOrgIssue(...args),
}))

describe('CloseOrgIssue command', () => {
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

  it('should close org issue by display number', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-123',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { id: 'issue-uuid-123', displayNumber: 1, status: 'closed' },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org' },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      displayNumber: 1,
    })
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      issueId: 'issue-uuid-123',
      status: 'closed',
    })
    expect(cmd.logs.some(log => log.includes('Closed organization issue #1'))).toBe(true)
  })

  it('should close org issue by display number with hash', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-456',
      displayNumber: 5,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { id: 'issue-uuid-456', displayNumber: 5, status: 'closed' },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '#5' },
      flags: { org: 'my-org' },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      displayNumber: 5,
    })
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      issueId: 'issue-uuid-456',
      status: 'closed',
    })
  })

  it('should close org issue by UUID directly', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { id: 'abc-123-uuid', displayNumber: 3, status: 'closed' },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: 'abc-123-uuid' },
      flags: { org: 'centy-io' },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).not.toHaveBeenCalled()
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'centy-io',
      issueId: 'abc-123-uuid',
      status: 'closed',
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org-issue.js')
    const mockIssue = { id: 'issue-uuid', displayNumber: 1, status: 'closed', title: 'Test' }
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: mockIssue,
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org', json: true },
    })
    await cmd.run()

    const output = JSON.parse(cmd.logs[0])
    expect(output.id).toBe('issue-uuid')
    expect(output.status).toBe('closed')
  })

  it('should handle daemon update failure', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org' },
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
      flags: { org: 'my-org' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
