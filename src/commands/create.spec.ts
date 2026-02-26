import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonCreateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-create-item.js', () => ({
  daemonCreateItem: (...args: unknown[]) => mockDaemonCreateItem(...args),
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

function createMockGenericItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'abc-123',
    itemType: 'issues',
    title: 'Test Issue',
    body: '',
    metadata: {
      displayNumber: 1,
      status: 'open',
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

describe('Create command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./create.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./create.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create issue with type and title', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem()
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: { title: 'Test Issue', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      title: 'Test Issue',
      body: '',
      status: '',
      priority: 0,
      customFields: {},
    })
    expect(cmd.logs.some(log => log.includes('Created issue'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('#1'))).toBe(true)
  })

  it('should create doc', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem({
      id: 'getting-started',
      itemType: 'docs',
      title: 'Getting Started',
      body: '# Hello',
      metadata: {
        displayNumber: 0,
        status: '',
        priority: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        deletedAt: '',
        customFields: {},
      },
    })
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'doc' },
      flags: {
        title: 'Getting Started',
        body: '# Hello',
        status: '',
        priority: 0,
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'docs',
      title: 'Getting Started',
      body: '# Hello',
      status: '',
      priority: 0,
      customFields: {},
    })
    expect(cmd.logs.some(log => log.includes('Created doc'))).toBe(true)
  })

  it('should create custom type item', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem({
      itemType: 'bugs',
      title: 'Login crash',
    })
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'bug' },
      flags: { title: 'Login crash', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'bugs' })
    )
  })

  it('should pluralize type ending in y', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem({ itemType: 'stories' })
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'story' },
      flags: { title: 'My Story', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'stories' })
    )
  })

  it('should not double-pluralize types ending in s', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem({ itemType: 'docs' })
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'docs' },
      flags: { title: 'Test', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'docs' })
    )
  })

  it('should pass custom fields', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem()
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: {
        title: 'Test',
        body: '',
        status: '',
        priority: 0,
        'custom-field': ['assignee=alice', 'team=backend'],
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        customFields: { assignee: 'alice', team: 'backend' },
      })
    )
  })

  it('should pass status and priority flags', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem()
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: { title: 'Urgent', body: '', status: 'open', priority: 1 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'open', priority: 1 })
    )
  })

  it('should output JSON when --json flag is set', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem()
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: { title: 'Test Issue', body: '', status: '', priority: 0, json: true },
    })

    await cmd.run()

    expect(cmd.logs).toHaveLength(1)
    const parsed = JSON.parse(cmd.logs[0])
    expect(parsed).toMatchObject({
      type: 'issue',
      id: 'abc-123',
      displayNumber: 1,
      title: 'Test Issue',
      status: 'open',
    })
  })

  it('should omit displayNumber from JSON when item has no display number', async () => {
    const { default: Command } = await import('./create.js')
    const item = createMockGenericItem({
      id: 'getting-started',
      itemType: 'docs',
      title: 'Getting Started',
      metadata: {
        displayNumber: 0,
        status: '',
        priority: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        deletedAt: '',
        customFields: {},
      },
    })
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'doc' },
      flags: { title: 'Getting Started', body: '', status: '', priority: 0, json: true },
    })

    await cmd.run()

    const parsed = JSON.parse(cmd.logs[0])
    expect(parsed.displayNumber).toBeUndefined()
    expect(parsed.type).toBe('doc')
  })

  it('should handle error response', async () => {
    const { default: Command } = await import('./create.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: false,
      error: 'Unknown item type',
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: { title: 'Test', body: '', status: '', priority: 0 },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Unknown item type')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./create.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: { title: 'Test', body: '', status: '', priority: 0 },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./create.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    const item = createMockGenericItem({ itemType: 'docs' })
    mockDaemonCreateItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      args: { type: 'doc' },
      flags: {
        title: 'A Doc',
        body: '',
        status: '',
        priority: 0,
        project: 'other-project',
      },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })
})
