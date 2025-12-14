import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteOrganization = vi.fn()

vi.mock('../../daemon/daemon-delete-organization.js', () => ({
  daemonDeleteOrganization: (...args: unknown[]) =>
    mockDaemonDeleteOrganization(...args),
}))

describe('DeleteOrg command', () => {
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

  it('should delete organization successfully with force flag', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization.mockResolvedValue({
      success: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonDeleteOrganization).toHaveBeenCalledWith({
      slug: 'my-org',
    })
    expect(cmd.logs.some(log => log.includes('Deleted organization'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
  })

  it('should error without force flag', async () => {
    const { default: Command } = await import('./org.js')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { slug: 'my-org' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('--force'))).toBe(true)
    expect(mockDaemonDeleteOrganization).not.toHaveBeenCalled()
  })

  it('should show warning message without force flag', async () => {
    const { default: Command } = await import('./org.js')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { slug: 'my-org' },
    })
    await runCommandSafely(cmd)

    expect(cmd.logs.some(log => log.includes('Warning'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization.mockResolvedValue({
      success: false,
      error: 'Organization has projects',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-org' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Organization has projects')
  })
})
