import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonUpdateOrganization = vi.fn()

vi.mock('../../daemon/daemon-update-organization.js', () => ({
  daemonUpdateOrganization: (...args: unknown[]) =>
    mockDaemonUpdateOrganization(...args),
}))

describe('UpdateOrg command', () => {
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

  it('should have update:organization alias', async () => {
    const { default: Command } = await import('./org.js')
    expect(Command.aliases).toContain('update:organization')
  })

  it('should update organization name', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: true,
      organization: { name: 'New Name', slug: 'my-org', description: '' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'my-org' },
      flags: { name: 'New Name' },
    })
    await cmd.run()

    expect(mockDaemonUpdateOrganization).toHaveBeenCalledWith({
      slug: 'my-org',
      name: 'New Name',
      description: undefined,
      newSlug: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Updated organization'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('New Name'))).toBe(true)
  })

  it('should update organization description', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: true,
      organization: { name: 'My Org', slug: 'my-org', description: 'Updated description' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'my-org' },
      flags: { description: 'Updated description' },
    })
    await cmd.run()

    expect(mockDaemonUpdateOrganization).toHaveBeenCalledWith({
      slug: 'my-org',
      name: undefined,
      description: 'Updated description',
      newSlug: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Description: Updated description'))).toBe(true)
  })

  it('should rename organization slug', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: true,
      organization: { name: 'My Org', slug: 'new-slug', description: '' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'old-slug' },
      flags: { 'new-slug': 'new-slug' },
    })
    await cmd.run()

    expect(mockDaemonUpdateOrganization).toHaveBeenCalledWith({
      slug: 'old-slug',
      name: undefined,
      description: undefined,
      newSlug: 'new-slug',
    })
    expect(cmd.logs.some(log => log.includes('Slug: new-slug'))).toBe(true)
  })

  it('should update multiple fields at once', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: true,
      organization: { name: 'New Name', slug: 'new-slug', description: 'New desc' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'old-slug' },
      flags: { name: 'New Name', description: 'New desc', 'new-slug': 'new-slug' },
    })
    await cmd.run()

    expect(mockDaemonUpdateOrganization).toHaveBeenCalledWith({
      slug: 'old-slug',
      name: 'New Name',
      description: 'New desc',
      newSlug: 'new-slug',
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org.js')
    const organization = { name: 'My Org', slug: 'my-org', description: 'Desc' }
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: true,
      organization,
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'my-org' },
      flags: { name: 'My Org', json: true },
    })
    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(organization, null, 2))
  })

  it('should error when no fields are specified', async () => {
    const { default: Command } = await import('./org.js')

    const cmd = createMockCommand(Command, {
      args: { slug: 'my-org' },
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('At least one of --name, --description, or --new-slug is required')
  })

  it('should handle daemon update failure', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: false,
      error: 'Organization not found',
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'unknown-org' },
      flags: { name: 'New Name' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Organization not found')
  })

  it('should not show description when empty', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonUpdateOrganization.mockResolvedValue({
      success: true,
      organization: { name: 'My Org', slug: 'my-org', description: '' },
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'my-org' },
      flags: { name: 'My Org' },
    })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Description:'))).toBe(false)
  })
})
