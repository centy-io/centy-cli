import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetAvailableLinkTypes = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-available-link-types.js', () => ({
  daemonGetAvailableLinkTypes: (...args: unknown[]) =>
    mockDaemonGetAvailableLinkTypes(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('ListLinkTypes command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./link-types.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should list available link types', async () => {
    const { default: Command } = await import('./link-types.js')
    mockDaemonGetAvailableLinkTypes.mockResolvedValue({
      linkTypes: [
        {
          name: 'blocks',
          inverse: 'blocked-by',
          description: 'Indicates blocking relationship',
          isBuiltin: true,
        },
        {
          name: 'relates-to',
          inverse: 'relates-to',
          description: 'General relationship',
          isBuiltin: true,
        },
        {
          name: 'custom-link',
          inverse: 'custom-inverse',
          description: '',
          isBuiltin: false,
        },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonGetAvailableLinkTypes).toHaveBeenCalledWith({
      projectPath: '/test/project',
    })
    expect(cmd.logs.some(log => log.includes('Available link types'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('blocks <-> blocked-by'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('(builtin)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('(custom)'))).toBe(true)
  })

  it('should show no link types message when empty', async () => {
    const { default: Command } = await import('./link-types.js')
    mockDaemonGetAvailableLinkTypes.mockResolvedValue({
      linkTypes: [],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No link types available'))).toBe(
      true
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./link-types.js')
    const linkTypes = [
      {
        name: 'blocks',
        inverse: 'blocked-by',
        description: 'Blocking',
        isBuiltin: true,
      },
    ]
    mockDaemonGetAvailableLinkTypes.mockResolvedValue({ linkTypes })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(linkTypes, null, 2))
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./link-types.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./link-types.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetAvailableLinkTypes.mockResolvedValue({ linkTypes: [] })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./link-types.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await expect(cmd.run()).rejects.toThrow('string error')
  })

  it('should display description when available', async () => {
    const { default: Command } = await import('./link-types.js')
    mockDaemonGetAvailableLinkTypes.mockResolvedValue({
      linkTypes: [
        {
          name: 'blocks',
          inverse: 'blocked-by',
          description: 'Indicates blocking relationship',
          isBuiltin: true,
        },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('Indicates blocking relationship'))
    ).toBe(true)
  })
})
