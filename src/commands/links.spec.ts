import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonListLinks = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-list-links.js', () => ({
  daemonListLinks: (...args: unknown[]) => mockDaemonListLinks(...args),
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('Links command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./links.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should list links for an entity', async () => {
    const { default: Command } = await import('./links.js')
    mockDaemonListLinks.mockResolvedValue({
      links: [
        {
          linkType: 'blocks',
          targetType: 'issue',
          targetId: '2',
          createdAt: '2025-01-01',
        },
        {
          linkType: 'relates-to',
          targetType: 'doc',
          targetId: 'arch',
          createdAt: '2025-01-02',
        },
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1' },
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonListLinks).toHaveBeenCalledWith({
      projectPath: '/test/project',
      entityId: '1',
      entityType: 'issue',
    })
    expect(cmd.logs.some(log => log.includes('Found 2 link(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('blocks --> issue:2'))).toBe(true)
  })

  it('should work with doc entity type', async () => {
    const { default: Command } = await import('./links.js')
    mockDaemonListLinks.mockResolvedValue({
      links: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'doc', id: 'getting-started' },
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonListLinks).toHaveBeenCalledWith({
      projectPath: '/test/project',
      entityId: 'getting-started',
      entityType: 'doc',
    })
    expect(cmd.logs.some(log => log.includes('No links found for doc'))).toBe(
      true
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./links.js')
    const links = [
      {
        linkType: 'blocks',
        targetType: 'issue',
        targetId: '2',
        createdAt: '2025-01-01',
      },
    ]
    mockDaemonListLinks.mockResolvedValue({ links, totalCount: 1 })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1' },
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(links, null, 2))
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./links.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })
})
