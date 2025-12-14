import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetOrgIssue = vi.fn()
const mockDaemonGetOrgIssueByDisplayNumber = vi.fn()

vi.mock('../../daemon/daemon-get-org-issue.js', () => ({
  daemonGetOrgIssue: (...args: unknown[]) => mockDaemonGetOrgIssue(...args),
}))

vi.mock('../../daemon/daemon-get-org-issue-by-display-number.js', () => ({
  daemonGetOrgIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetOrgIssueByDisplayNumber(...args),
}))

describe('GetOrgIssue command', () => {
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

  it('should get org issue by display number', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-123',
      displayNumber: 1,
      title: 'Test Issue',
      description: 'A test description',
      metadata: {
        status: 'open',
        priority: 1,
        priorityLabel: 'High',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        referencedProjects: ['project-1', 'project-2'],
      },
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
    expect(mockDaemonGetOrgIssue).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Organization Issue #1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Test Issue'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Status: open'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Priority: High'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Referenced Projects'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('project-1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('A test description'))).toBe(true)
  })

  it('should get org issue by display number with hash', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid-456',
      displayNumber: 5,
      title: 'Test',
      metadata: { status: 'open', priority: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
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
  })

  it('should get org issue by UUID directly', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssue.mockResolvedValue({
      id: 'abc-123-uuid',
      displayNumber: 3,
      title: 'UUID Issue',
      metadata: { status: 'closed', priority: 3, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: 'abc-123-uuid' },
      flags: { org: 'centy-io' },
    })
    await cmd.run()

    expect(mockDaemonGetOrgIssueByDisplayNumber).not.toHaveBeenCalled()
    expect(mockDaemonGetOrgIssue).toHaveBeenCalledWith({
      orgSlug: 'centy-io',
      issueId: 'abc-123-uuid',
    })
    expect(cmd.logs.some(log => log.includes('UUID Issue'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org-issue.js')
    const mockIssue = {
      id: 'issue-uuid',
      displayNumber: 1,
      title: 'Test',
      metadata: { status: 'open', priority: 1 },
    }
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue(mockIssue)

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org', json: true },
    })
    await cmd.run()

    const output = JSON.parse(cmd.logs[0])
    expect(output.id).toBe('issue-uuid')
    expect(output.title).toBe('Test')
  })

  it('should display priority as P-number when priorityLabel is not available', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
      title: 'Test',
      metadata: { status: 'open', priority: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org' },
    })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Priority: P2'))).toBe(true)
  })

  it('should handle issue without metadata', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
      title: 'Minimal Issue',
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org' },
    })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Minimal Issue'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Status:'))).toBe(false)
  })

  it('should handle issue without description', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
      title: 'No Description',
      metadata: { status: 'open', priority: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org' },
    })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Description:'))).toBe(false)
  })

  it('should handle issue without referenced projects', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonGetOrgIssueByDisplayNumber.mockResolvedValue({
      id: 'issue-uuid',
      displayNumber: 1,
      title: 'No Projects',
      metadata: {
        status: 'open',
        priority: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        referencedProjects: [],
      },
    })

    const cmd = createMockCommand(Command, {
      args: { identifier: '1' },
      flags: { org: 'my-org' },
    })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Referenced Projects'))).toBe(false)
  })

  it('should handle get issue failure', async () => {
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
