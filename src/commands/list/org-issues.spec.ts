import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListOrgIssues = vi.fn()

vi.mock('../../daemon/daemon-list-org-issues.js', () => ({
  daemonListOrgIssues: (...args: unknown[]) => mockDaemonListOrgIssues(...args),
}))

describe('ListOrgIssues command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./org-issues.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./org-issues.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list org issues with --org flag', async () => {
    const { default: Command } = await import('./org-issues.js')
    mockDaemonListOrgIssues.mockResolvedValue({
      issues: [
        {
          id: 'issue-1',
          displayNumber: 1,
          title: 'Organization Bug',
          metadata: {
            status: 'open',
            priority: 1,
            priorityLabel: 'P1',
            referencedProjects: ['proj-a', 'proj-b'],
          },
        },
        {
          id: 'issue-2',
          displayNumber: 2,
          title: 'Feature Request',
          metadata: {
            status: 'in-progress',
            priority: 2,
            priorityLabel: '',
            referencedProjects: [],
          },
        },
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListOrgIssues).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      status: undefined,
      priority: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Found 2 issue(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Organization Bug'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('(2 projects)'))).toBe(true)
  })

  it('should list org issues with org as argument', async () => {
    const { default: Command } = await import('./org-issues.js')
    mockDaemonListOrgIssues.mockResolvedValue({
      issues: [
        {
          id: 'issue-1',
          displayNumber: 1,
          title: 'Test Issue',
          metadata: { status: 'open', priority: 2, priorityLabel: 'P2' },
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { org: 'centy-io' },
    })

    await cmd.run()

    expect(mockDaemonListOrgIssues).toHaveBeenCalledWith({
      orgSlug: 'centy-io',
      status: undefined,
      priority: undefined,
    })
  })

  it('should filter by status', async () => {
    const { default: Command } = await import('./org-issues.js')
    mockDaemonListOrgIssues.mockResolvedValue({
      issues: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', status: 'open', json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListOrgIssues).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      status: 'open',
      priority: undefined,
    })
  })

  it('should filter by priority', async () => {
    const { default: Command } = await import('./org-issues.js')
    mockDaemonListOrgIssues.mockResolvedValue({
      issues: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', priority: 1, json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListOrgIssues).toHaveBeenCalledWith({
      orgSlug: 'my-org',
      status: undefined,
      priority: 1,
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org-issues.js')
    const issues = [
      { id: 'issue-1', displayNumber: 1, title: 'Test' },
    ]
    mockDaemonListOrgIssues.mockResolvedValue({
      issues,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(issues, null, 2))
  })

  it('should show message when no issues found', async () => {
    const { default: Command } = await import('./org-issues.js')
    mockDaemonListOrgIssues.mockResolvedValue({
      issues: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No issues found'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Create one with'))).toBe(true)
  })

  it('should error when org slug is not provided', async () => {
    const { default: Command } = await import('./org-issues.js')

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Organization slug is required'))).toBe(
      true
    )
  })

  it('should handle issues without priorityLabel', async () => {
    const { default: Command } = await import('./org-issues.js')
    mockDaemonListOrgIssues.mockResolvedValue({
      issues: [
        {
          id: 'issue-1',
          displayNumber: 1,
          title: 'Test',
          metadata: { status: 'open', priority: 3, priorityLabel: '' },
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('[P3]'))).toBe(true)
  })
})
