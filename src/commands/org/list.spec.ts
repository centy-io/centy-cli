import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockDaemonListOrganizations = vi.fn()

vi.mock('../../daemon/daemon-list-organizations.js', () => ({
  daemonListOrganizations: (...args: unknown[]) =>
    mockDaemonListOrganizations(...args),
}))

describe('OrgList command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list organizations successfully', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListOrganizations.mockResolvedValue({
      organizations: [
        {
          name: 'My Org',
          slug: 'my-org',
          description: 'Test organization',
          projectCount: 3,
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListOrganizations).toHaveBeenCalledWith({})
    expect(cmd.logs.some(log => log.includes('My Org'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Projects: 3'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./list.js')
    const mockOrgs = [{ name: 'My Org', slug: 'my-org' }]
    mockDaemonListOrganizations.mockResolvedValue({
      organizations: mockOrgs,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"name": "My Org"'))).toBe(true)
  })

  it('should show empty message when no organizations', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListOrganizations.mockResolvedValue({
      organizations: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No organizations found'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('centy org create'))).toBe(true)
  })

  it('should display organization count', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListOrganizations.mockResolvedValue({
      organizations: [
        { name: 'Org 1', slug: 'org-1', projectCount: 1 },
        { name: 'Org 2', slug: 'org-2', projectCount: 2 },
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('2 organization(s)'))).toBe(true)
  })

  it('should display organization description when present', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListOrganizations.mockResolvedValue({
      organizations: [
        {
          name: 'My Org',
          slug: 'my-org',
          description: 'A great organization',
          projectCount: 0,
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('A great organization'))).toBe(
      true
    )
  })
})
