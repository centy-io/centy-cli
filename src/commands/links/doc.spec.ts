import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListLinks = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-links.js', () => ({
  daemonListLinks: (...args: unknown[]) => mockDaemonListLinks(...args),
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

describe('LinksDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should list links for a doc', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonListLinks.mockResolvedValue({
      links: [
        {
          linkType: 'relates-to',
          targetType: 'issue',
          targetId: '5',
          createdAt: '2025-01-01',
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonListLinks).toHaveBeenCalledWith({
      projectPath: '/test/project',
      entityId: 'getting-started',
      entityType: 'doc',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 link(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('relates-to --> issue:5'))).toBe(
      true
    )
  })

  it('should show no links message when empty', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonListLinks.mockResolvedValue({
      links: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No links found'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./doc.js')
    const links = [
      {
        linkType: 'relates-to',
        targetType: 'issue',
        targetId: '5',
        createdAt: '2025-01-01',
      },
    ]
    mockDaemonListLinks.mockResolvedValue({ links, totalCount: 1 })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(links, null, 2))
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListLinks.mockResolvedValue({ links: [], totalCount: 0 })

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./doc.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      args: { slug: 'getting-started' },
      flags: {},
    })

    await expect(cmd.run()).rejects.toThrow('string error')
  })
})
