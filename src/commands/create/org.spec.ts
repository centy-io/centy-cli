import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateOrganization = vi.fn()

vi.mock('../../daemon/daemon-create-organization.js', () => ({
  daemonCreateOrganization: (...args: unknown[]) =>
    mockDaemonCreateOrganization(...args),
}))

describe('CreateOrg command', () => {
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

  it('should create organization successfully', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonCreateOrganization.mockResolvedValue({
      success: true,
      organization: {
        name: 'My Organization',
        slug: 'my-organization',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { name: 'My Organization' },
    })

    await cmd.run()

    expect(mockDaemonCreateOrganization).toHaveBeenCalledWith({
      name: 'My Organization',
      slug: undefined,
      description: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Created organization'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('My Organization'))).toBe(true)
  })

  it('should create organization with custom slug', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonCreateOrganization.mockResolvedValue({
      success: true,
      organization: {
        name: 'My Organization',
        slug: 'my-org',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, slug: 'my-org' },
      args: { name: 'My Organization' },
    })

    await cmd.run()

    expect(mockDaemonCreateOrganization).toHaveBeenCalledWith({
      name: 'My Organization',
      slug: 'my-org',
      description: undefined,
    })
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
  })

  it('should create organization with description', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonCreateOrganization.mockResolvedValue({
      success: true,
      organization: {
        name: 'My Organization',
        slug: 'my-organization',
        description: 'A great org',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, description: 'A great org' },
      args: { name: 'My Organization' },
    })

    await cmd.run()

    expect(mockDaemonCreateOrganization).toHaveBeenCalledWith({
      name: 'My Organization',
      slug: undefined,
      description: 'A great org',
    })
    expect(cmd.logs.some(log => log.includes('A great org'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org.js')
    const mockOrg = { name: 'My Org', slug: 'my-org' }
    mockDaemonCreateOrganization.mockResolvedValue({
      success: true,
      organization: mockOrg,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { name: 'My Org' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"name": "My Org"'))).toBe(true)
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonCreateOrganization.mockResolvedValue({
      success: false,
      error: 'Organization already exists',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { name: 'My Organization' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Organization already exists')
  })
})
