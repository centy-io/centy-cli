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

describe('Issue command (alias for get issue)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should get issue by display number', async () => {
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
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
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'issues',
      itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
  })

  it('should always use issues as item type', async () => {
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'issues' })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issue.js')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(item, null, 2))
  })

  it('should search globally with --global flag by UUID', async () => {
    const { default: Command } = await import('./issue.js')
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
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetIssuesByUuid).toHaveBeenCalledWith({
      uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 issue(s)'))).toBe(true)
  })

  it('should search globally with --global flag by display number', async () => {
    const { default: Command } = await import('./issue.js')
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
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockSearchItemsByDisplayNumberGlobally).toHaveBeenCalledWith(
      'issues',
      1
    )
    expect(cmd.logs.some(log => log.includes('Found 1 issue(s)'))).toBe(true)
  })

  it('should handle daemon get item failure', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetItem.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    const item = createMockGenericItem()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false, project: 'other-project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should have only id arg (no type arg)', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Object.keys(Command.args)).toEqual(['id'])
    expect(Command.args).not.toHaveProperty('type')
  })
})
