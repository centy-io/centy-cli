import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonListItems = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-list-items.js', () => ({
  daemonListItems: (...args: unknown[]) => mockDaemonListItems(...args),
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

describe('Issues command (shorthand for list issues)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should have list:issues alias', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command.aliases).toContain('list:issues')
  })

  it('should list issues and show count', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      totalCount: 2,
      items: [
        {
          id: 'item-1',
          title: 'First Issue',
          metadata: { displayNumber: 1, status: 'open', priority: 1 },
        },
        {
          id: 'item-2',
          title: 'Second Issue',
          metadata: { displayNumber: 2, status: 'closed', priority: 2 },
        },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {
        json: false,
        status: undefined,
        priority: undefined,
        'include-deleted': false,
        limit: 0,
        offset: 0,
      },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      status: '',
      priority: 0,
      includeDeleted: false,
      limit: 0,
      offset: 0,
    })
    expect(cmd.logs.some(log => log.includes('Found 2 issues'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('First Issue'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Second Issue'))).toBe(true)
  })

  it('should show "no issues found" when empty', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      totalCount: 0,
      items: [],
    })

    const cmd = createMockCommand(Command, {
      flags: {
        json: false,
        status: undefined,
        priority: undefined,
        'include-deleted': false,
        limit: 0,
        offset: 0,
      },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No issues found'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issues.js')
    const items = [
      { id: 'item-1', title: 'First Issue', metadata: { displayNumber: 1 } },
    ]
    mockDaemonListItems.mockResolvedValue({
      success: true,
      totalCount: 1,
      items,
    })

    const cmd = createMockCommand(Command, {
      flags: {
        json: true,
        status: undefined,
        priority: undefined,
        'include-deleted': false,
        limit: 0,
        offset: 0,
      },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(items, null, 2))
  })

  it('should filter by status when status flag is set', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      totalCount: 1,
      items: [
        {
          id: 'item-1',
          title: 'Open Issue',
          metadata: { displayNumber: 1, status: 'open', priority: 0 },
        },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {
        json: false,
        status: 'open',
        priority: undefined,
        'include-deleted': false,
        limit: 0,
        offset: 0,
      },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'open' })
    )
  })

  it('should handle daemon list items failure', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListItems.mockResolvedValue({
      success: false,
      error: 'Failed to list issues',
    })

    const cmd = createMockCommand(Command, {
      flags: {
        json: false,
        status: undefined,
        priority: undefined,
        'include-deleted': false,
        limit: 0,
        offset: 0,
      },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Failed to list issues')
  })
})
