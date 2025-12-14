import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateOrgIssue = vi.fn()

vi.mock('../../daemon/daemon-create-org-issue.js', () => ({
  daemonCreateOrgIssue: (...args: unknown[]) =>
    mockDaemonCreateOrgIssue(...args),
}))

describe('CreateOrgIssue command', () => {
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

  it('should create org issue successfully', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: true,
      id: 'issue-123',
      displayNumber: 1,
      issueNumber: 'ORG-1',
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', title: 'New Issue', json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        orgSlug: 'my-org',
        title: 'New Issue',
      })
    )
    expect(cmd.logs.some(log => log.includes('Created'))).toBe(true)
  })

  it('should use org from args when flag not provided', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: true,
      id: 'issue-123',
      displayNumber: 1,
      issueNumber: 'ORG-1',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'New Issue', json: false },
      args: { org: 'arg-org' },
    })

    await cmd.run()

    expect(mockDaemonCreateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ orgSlug: 'arg-org' })
    )
  })

  it('should error when no org provided', async () => {
    const { default: Command } = await import('./org-issue.js')

    const cmd = createMockCommand(Command, {
      flags: { title: 'New Issue', json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(
      cmd.errors.some(e => e.includes('Organization slug is required'))
    ).toBe(true)
  })

  it('should create with priority', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: true,
      id: 'issue-123',
      displayNumber: 1,
      issueNumber: 'ORG-1',
    })

    const cmd = createMockCommand(Command, {
      flags: {
        org: 'my-org',
        title: 'New Issue',
        priority: 'high',
        json: false,
      },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 1 })
    )
  })

  it('should create with description', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: true,
      id: 'issue-123',
      displayNumber: 1,
      issueNumber: 'ORG-1',
    })

    const cmd = createMockCommand(Command, {
      flags: {
        org: 'my-org',
        title: 'New Issue',
        description: 'Details here',
        json: false,
      },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Details here' })
    )
  })

  it('should create with referenced projects', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: true,
      id: 'issue-123',
      displayNumber: 1,
      issueNumber: 'ORG-1',
    })

    const cmd = createMockCommand(Command, {
      flags: {
        org: 'my-org',
        title: 'New Issue',
        projects: '/path/a, /path/b',
        json: false,
      },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateOrgIssue).toHaveBeenCalledWith(
      expect.objectContaining({ referencedProjects: ['/path/a', '/path/b'] })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: true,
      id: 'issue-123',
      displayNumber: 1,
      issueNumber: 'ORG-1',
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', title: 'New Issue', json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"displayNumber": 1'))).toBe(true)
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./org-issue.js')
    mockDaemonCreateOrgIssue.mockResolvedValue({
      success: false,
      error: 'Organization not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { org: 'my-org', title: 'New Issue', json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Organization not found')
  })
})
