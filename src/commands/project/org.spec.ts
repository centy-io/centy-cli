import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonSetProjectOrganization = vi.fn()

vi.mock('../../daemon/daemon-set-project-organization.js', () => ({
  daemonSetProjectOrganization: (...args: unknown[]) =>
    mockDaemonSetProjectOrganization(...args),
}))

describe('ProjectOrg command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./org.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./org.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should have project:organization alias', async () => {
    const { default: Command } = await import('./org.js')

    expect(Command.aliases).toContain('project:organization')
  })

  it('should assign project to organization successfully', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonSetProjectOrganization.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { remove: false, json: false },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ organizationSlug: 'my-org' })
    )
    expect(cmd.logs.some(log => log.includes('Assigned'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
  })

  it('should remove project from organization with --remove flag', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonSetProjectOrganization.mockResolvedValue({
      success: true,
      project: { name: 'My Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { remove: true, json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonSetProjectOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ organizationSlug: '' })
    )
    expect(cmd.logs.some(log => log.includes('Removed'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org.js')
    const mockProject = { name: 'My Project', organization: 'my-org' }
    mockDaemonSetProjectOrganization.mockResolvedValue({
      success: true,
      project: mockProject,
    })

    const cmd = createMockCommand(Command, {
      flags: { remove: false, json: true },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"name"'))).toBe(true)
  })

  it('should error when no slug and no --remove flag', async () => {
    const { default: Command } = await import('./org.js')

    const cmd = createMockCommand(Command, {
      flags: { remove: false, json: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Provide an organization slug or use --remove to unassign')
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonSetProjectOrganization.mockResolvedValue({
      success: false,
      error: 'Organization not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { remove: false, json: false },
      args: { slug: 'unknown-org' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Organization not found')
  })

  it('should use path flag when provided', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonSetProjectOrganization.mockResolvedValue({
      success: true,
      project: { name: 'Other Project' },
    })

    const cmd = createMockCommand(Command, {
      flags: { remove: false, json: false, path: '/other/project' },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonSetProjectOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })
})
