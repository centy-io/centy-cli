import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetItem = vi.fn()
const mockDaemonGetIssuesByUuid = vi.fn()
const mockSearchItemsByDisplayNumberGlobally = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

vi.mock('../daemon/daemon-get-issues-by-uuid.js', () => ({
  daemonGetIssuesByUuid: (...args: unknown[]) =>
    mockDaemonGetIssuesByUuid(...args),
}))

vi.mock('../daemon/daemon-search-items-globally.js', () => ({
  searchItemsByDisplayNumberGlobally: (...args: unknown[]) =>
    mockSearchItemsByDisplayNumberGlobally(...args),
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

vi.mock('../utils/cross-project-search.js', () => ({
  isValidUuid: vi.fn(id =>
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
  ),
}))

function createMockGenericItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    itemType: 'issues',
    title: 'Test Issue',
    body: 'Test description',
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

describe('Get command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should get issue by display number', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'issue', id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      itemId: '',
      displayNumber: 1,
    })
    expect(cmd.logs.some(log => log.includes('Issue #1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Test Issue'))).toBe(true)
  })

  it('should get issue by UUID', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'issue', id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
  })

  it('should get doc by slug', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem({
      id: 'getting-started',
      itemType: 'docs',
      title: 'Getting Started',
      body: '# Welcome',
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
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'doc', id: 'getting-started' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'docs',
      itemId: 'getting-started',
    })
    expect(cmd.logs.some(log => log.includes('Getting Started'))).toBe(true)
  })

  it('should get user by id', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem({
      id: 'john-doe',
      itemType: 'users',
      title: 'John Doe',
      body: '',
    })
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'user', id: 'john-doe' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'users',
      itemId: 'john-doe',
    })
  })

  it('should get custom type item', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem({
      itemType: 'bugs',
      title: 'Login crash',
    })
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'bug', id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'bugs',
      itemId: '',
      displayNumber: 1,
    })
  })

  it('should handle plural type input', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'issues', id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      itemId: '',
      displayNumber: 1,
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { type: 'issue', id: '1' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(item, null, 2))
  })

  it('should search globally with --global flag for issues', async () => {
    const { default: Command } = await import('./get.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [
        {
          issue: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            displayNumber: 1,
            title: 'Test Issue',
            metadata: {
              status: 'open',
              priority: 1,
              priorityLabel: 'P1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
            },
          },
          projectName: 'project-a',
          projectPath: '/path/to/project-a',
        },
      ],
      totalCount: 1,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { type: 'issue', id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetIssuesByUuid).toHaveBeenCalledWith({
      uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 issue(s)'))).toBe(true)
  })

  it('should error on global search for non-issue types', async () => {
    const { default: Command } = await import('./get.js')

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { type: 'doc', id: 'test' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('only supported for issues'))).toBe(
      true
    )
  })

  it('should search globally with --global flag for issues by display number', async () => {
    const { default: Command } = await import('./get.js')
    mockSearchItemsByDisplayNumberGlobally.mockResolvedValue({
      items: [
        {
          item: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
          },
          projectName: 'project-a',
          projectPath: '/path/to/project-a',
          displayPath: '~/project-a',
        },
      ],
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { type: 'issue', id: '1' },
    })

    await cmd.run()

    expect(mockSearchItemsByDisplayNumberGlobally).toHaveBeenCalledWith(
      'issues',
      1
    )
    expect(cmd.logs.some(log => log.includes('Found 1 issue(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('project-a'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./get.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'issue', id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon get item failure', async () => {
    const { default: Command } = await import('./get.js')
    mockDaemonGetItem.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'issue', id: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./get.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false, project: 'other-project' },
      args: { type: 'issue', id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should pluralize type ending in y', async () => {
    const { default: Command } = await import('./get.js')
    const item = createMockGenericItem({ itemType: 'categories' })
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { type: 'category', id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'categories',
      itemId: '',
      displayNumber: 1,
    })
  })
})
