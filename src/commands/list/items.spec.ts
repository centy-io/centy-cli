import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListItems = vi.fn()
const mockListItemsGlobally = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-items.js', () => ({
  daemonListItems: (...args: unknown[]) => mockDaemonListItems(...args),
}))

vi.mock('../../daemon/daemon-list-items-globally.js', () => ({
  listItemsGlobally: (...args: unknown[]) => mockListItemsGlobally(...args),
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

function createMockItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'uuid-123',
    itemType: 'issues',
    title: 'Test issue',
    body: '',
    metadata: {
      displayNumber: 1,
      status: 'open',
      priority: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

describe('ListItems command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./items.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./items.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list issues', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [createMockItem()],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { limit: 0, offset: 0 },
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        itemType: 'issues',
        limit: 0,
        offset: 0,
        filter: '',
      })
    )
    expect(cmd.logs.some(l => l.includes('Found 1 issues'))).toBe(true)
    expect(
      cmd.logs.some(l => l.includes('Test issue') && l.includes('#1'))
    ).toBe(true)
  })

  it('should pluralize singular type arg', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: {},
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'issues' })
    )
  })

  it('should pass status filter', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { status: 'open' },
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: JSON.stringify({ status: 'open' }),
      })
    )
  })

  it('should use $ne operator when status starts with !', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { status: '!closed' },
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: JSON.stringify({ status: { $ne: 'closed' } }),
      })
    )
  })

  it('should pass priority filter', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { priority: 1 },
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: JSON.stringify({ priority: 1 }),
      })
    )
  })

  it('should combine status and priority filters', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { status: 'open', priority: 1 },
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: JSON.stringify({ status: 'open', priority: 1 }),
      })
    )
  })

  it('should output JSON when --json flag is set', async () => {
    const { default: Command } = await import('./items.js')
    const items = [createMockItem()]
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { json: true },
    })
    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(items, null, 2))
  })

  it('should show message when no items found', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: {},
    })
    await cmd.run()

    expect(cmd.logs[0]).toContain('No issues found.')
  })

  it('should handle item without display number', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [
        createMockItem({
          metadata: {
            displayNumber: 0,
            status: 'open',
            priority: 0,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
            deletedAt: '',
            customFields: {},
          },
        }),
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'docs' },
      flags: {},
    })
    await cmd.run()

    expect(
      cmd.logs.some(l => l.includes('Test issue') && !l.includes('#'))
    ).toBe(true)
  })

  it('should pass limit and offset flags', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { limit: 10, offset: 5 },
    })
    await cmd.run()

    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 5 })
    )
  })

  it('should error on daemon failure', async () => {
    const { default: Command } = await import('./items.js')
    mockDaemonListItems.mockResolvedValue({
      success: false,
      error: 'item type not found',
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'unknown' },
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('item type not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./items.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./items.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListItems.mockResolvedValue({
      success: true,
      items: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issues' },
      flags: { project: 'other' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other')
    expect(mockDaemonListItems).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })

  describe('--global flag', () => {
    it('should call listItemsGlobally instead of daemonListItems', async () => {
      const { default: Command } = await import('./items.js')
      mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: { global: true, limit: 0, offset: 0 },
      })
      await cmd.run()

      expect(mockListItemsGlobally).toHaveBeenCalledWith('issues', '', 0, 0)
      expect(mockDaemonListItems).not.toHaveBeenCalled()
    })

    it('should skip resolveProjectPath and ensureInitialized when --global is set', async () => {
      const { default: Command } = await import('./items.js')
      mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: { global: true },
      })
      await cmd.run()

      expect(mockResolveProjectPath).not.toHaveBeenCalled()
      expect(mockEnsureInitialized).not.toHaveBeenCalled()
    })

    it('should display items with project name prefix', async () => {
      const { default: Command } = await import('./items.js')
      mockListItemsGlobally.mockResolvedValue({
        items: [
          {
            item: createMockItem(),
            projectName: 'centy-daemon',
            projectPath: '/path/to/centy-daemon',
            displayPath: '~/centy-daemon',
          },
        ],
        errors: [],
      })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: { global: true },
      })
      await cmd.run()

      expect(
        cmd.logs.some(
          l => l.includes('[centy-daemon]') && l.includes('Test issue')
        )
      ).toBe(true)
    })

    it('should include projectName and projectPath in JSON output', async () => {
      const { default: Command } = await import('./items.js')
      const item = createMockItem()
      mockListItemsGlobally.mockResolvedValue({
        items: [
          {
            item,
            projectName: 'centy-daemon',
            projectPath: '/path/to/centy-daemon',
            displayPath: '~/centy-daemon',
          },
        ],
        errors: [],
      })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: { global: true, json: true },
      })
      await cmd.run()

      const parsed = JSON.parse(cmd.logs[0])
      expect(parsed[0].projectName).toBe('centy-daemon')
      expect(parsed[0].projectPath).toBe('/path/to/centy-daemon')
      expect(parsed[0].id).toBe('uuid-123')
    })

    it('should pass filters to listItemsGlobally', async () => {
      const { default: Command } = await import('./items.js')
      mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: {
          global: true,
          status: 'open',
          priority: 1,
          limit: 0,
          offset: 0,
        },
      })
      await cmd.run()

      expect(mockListItemsGlobally).toHaveBeenCalledWith(
        'issues',
        JSON.stringify({ status: 'open', priority: 1 }),
        0,
        0
      )
    })

    it('should pass limit and offset to listItemsGlobally', async () => {
      const { default: Command } = await import('./items.js')
      mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: { global: true, limit: 5, offset: 2 },
      })
      await cmd.run()

      expect(mockListItemsGlobally).toHaveBeenCalledWith('issues', '', 5, 2)
    })

    it('should show no items message when global returns empty', async () => {
      const { default: Command } = await import('./items.js')
      mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })

      const cmd = createMockCommand(Command, {
        args: { type: 'issues' },
        flags: { global: true },
      })
      await cmd.run()

      expect(cmd.logs[0]).toContain('No issues found.')
    })
  })
})
