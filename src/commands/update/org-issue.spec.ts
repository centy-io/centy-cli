import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdateOrgIssue = vi.fn()
const mockDaemonGetOrgIssueByDisplayNumber = vi.fn()

vi.mock('../../daemon/daemon-update-org-issue.js', () => ({
  daemonUpdateOrgIssue: (...args: unknown[]) =>
    mockDaemonUpdateOrgIssue(...args),
}))

vi.mock('../../daemon/daemon-get-org-issue-by-display-number.js', () => ({
  daemonGetOrgIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetOrgIssueByDisplayNumber(...args),
}))

describe('UpdateOrgIssue command', () => {
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

  it('should update org issue by display number', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-123',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { id: 'issue-uuid-123', displayNumber: 1, title: 'Updated' },
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', title: 'Updated Title', json: false },
      args: { identifier: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      displayNumber: 1,
    })
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        orgSlug: 'my-org',
        issueId: 'issue-uuid-123',
        title: 'Updated Title',
      })
    )
    expect(cmd.logs.some(log => log.includes('Updated organization issue #1'))).toBe(
      true
    )
  })

  it('should update org issue by display number with hash', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-456',
      displayNumber: 5,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 5 },
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', status: 'closed', json: false },
      args: { identifier: '#5' },
    })

    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      displayNumber: 5,
    })
  })

  it('should update org issue by UUID', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { id: 'abc-123-uuid', displayNumber: 10 },
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', description: 'New description', json: false },
      args: { identifier: 'abc-123-uuid' },
    })

    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).not.toHaveBeenCalled()
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        issueId: 'abc-123-uuid',
        description: 'New description',
      })
    )
  })

  it('should update priority with high/medium/low', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    // Test high priority
    const cmdHigh = createMockCommand(Command, {
      flags: { org: 'my-org', priority: 'high', json: false },
      args: { identifier: '1' },
    })
    await cmdHigh.run()
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 1 })
    )

    // Test medium priority
    vi.clearAllMocks()
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmdMedium = createMockCommand(Command, {
      flags: { org: 'my-org', priority: 'medium', json: false },
      args: { identifier: '1' },
    })
    await cmdMedium.run()
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 2 })
    )

    // Test low priority
    vi.clearAllMocks()
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmdLow = createMockCommand(Command, {
      flags: { org: 'my-org', priority: 'low', json: false },
      args: { identifier: '1' },
    })
    await cmdLow.run()
    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 3 })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org-issue.js')
    const issue = { id: 'issue-uuid', displayNumber: 1, title: 'Test' }
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', title: 'Test', json: true },
      args: { identifier: '1' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(issue, null, 2))
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
      flags: { org: 'my-org', title: 'Test', json: false },
      args: { identifier: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle add-project and remove-project flags', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
      metadata: {
        referencedProjects: ['/existing/project'],
      },
    })
    mockDaemonUpdateOrgIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        org: 'my-org',
        'add-project': ['/new/project'],
        json: false,
      },
      args: { identifier: '1' },
    })

    await cmd.run()

    expect(mockDaemonUpdateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        referencedProjects: expect.arrayContaining([
          '/existing/project',
          '/new/project',
        ]),
      })
    )
  })
})
