import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetOrganization = vi.fn()

vi.mock('../../daemon/daemon-get-organization.js', () => ({
  daemonGetOrganization: (...args: unknown[]) =>
    mockDaemonGetOrganization(...args),
}))

describe('GetOrg command', () => {
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

  it('should get organization details successfully', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonGetOrganization.mockResolvedValue({
      found: true,
      organization: {
        name: 'My Organization',
        slug: 'my-org',
        description: 'Test description',
        projectCount: 5,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonGetOrganization).toHaveBeenCalledWith({
      slug: 'my-org',
    })
    expect(cmd.logs.some(log => log.includes('My Organization'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Test description'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Projects: 5'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./org.js')
    const mockOrg = {
      name: 'My Org',
      slug: 'my-org',
      projectCount: 3,
    }
    mockDaemonGetOrganization.mockResolvedValue({
      found: true,
      organization: mockOrg,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"name": "My Org"'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('"projectCount": 3'))).toBe(true)
  })

  it('should error when organization not found', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonGetOrganization.mockResolvedValue({
      found: false,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { slug: 'nonexistent' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('not found'))).toBe(true)
    expect(cmd.errors.some(e => e.includes('nonexistent'))).toBe(true)
  })

  it('should display timestamps', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonGetOrganization.mockResolvedValue({
      found: true,
      organization: {
        name: 'My Organization',
        slug: 'my-org',
        projectCount: 0,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-20T15:30:00Z',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Created:'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Updated:'))).toBe(true)
  })
})
