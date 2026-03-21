import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteOrganization = vi.fn()
const mockPromptQuestion = vi.fn()

vi.mock('../../daemon/daemon-delete-organization.js', () => ({
  daemonDeleteOrganization: (...args: unknown[]) =>
    mockDaemonDeleteOrganization(...args),
}))

vi.mock('../../utils/create-prompt-interface.js', () => ({
  promptQuestion: (...args: unknown[]) => mockPromptQuestion(...args),
}))

describe('UntrackOrg command', () => {
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

  it('should untrack organization successfully with --force flag', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization.mockResolvedValue({
      success: true,
      error: '',
      unassignedProjects: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonDeleteOrganization).toHaveBeenCalledWith({
      slug: 'my-org',
      cascade: false,
    })
    expect(cmd.logs.some(log => log.includes('Untracked organization'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('my-org'))).toBe(true)
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization.mockResolvedValue({
      success: false,
      error: 'Organization not found',
      unassignedProjects: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-org' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Organization not found')
  })

  it('should prompt for cascade when ORG_HAS_PROJECTS error is returned and cascade on y', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization
      .mockResolvedValueOnce({
        success: false,
        error: 'Organization has 3 projects. Reassign or remove them first.',
        unassignedProjects: 0,
      })
      .mockResolvedValueOnce({
        success: true,
        error: '',
        unassignedProjects: 3,
      })
    mockPromptQuestion.mockResolvedValue('y')

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonDeleteOrganization).toHaveBeenCalledTimes(2)
    expect(mockDaemonDeleteOrganization).toHaveBeenNthCalledWith(1, {
      slug: 'my-org',
      cascade: false,
    })
    expect(mockDaemonDeleteOrganization).toHaveBeenNthCalledWith(2, {
      slug: 'my-org',
      cascade: true,
    })
    expect(cmd.logs.some(log => log.includes('Untracked organization'))).toBe(
      true
    )
  })

  it('should exit with error when ORG_HAS_PROJECTS and user declines cascade', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization.mockResolvedValue({
      success: false,
      error: 'Organization has 3 projects. Reassign or remove them first.',
      unassignedProjects: 0,
    })
    mockPromptQuestion.mockResolvedValue('n')

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-org' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(mockDaemonDeleteOrganization).toHaveBeenCalledTimes(1)
  })

  it('should prompt for confirmation without --force and proceed on y', async () => {
    const { default: Command } = await import('./org.js')
    mockDaemonDeleteOrganization.mockResolvedValue({
      success: true,
      error: '',
      unassignedProjects: 0,
    })
    mockPromptQuestion.mockResolvedValue('y')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonDeleteOrganization).toHaveBeenCalled()
  })

  it('should prompt for confirmation without --force and cancel on n', async () => {
    const { default: Command } = await import('./org.js')
    mockPromptQuestion.mockResolvedValue('n')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { slug: 'my-org' },
    })

    await cmd.run()

    expect(mockDaemonDeleteOrganization).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })
})
