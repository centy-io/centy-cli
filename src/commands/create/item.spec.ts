import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-create-item.js', () => ({
  daemonCreateItem: (...args: unknown[]) => mockDaemonCreateItem(...args),
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

describe('CreateItem command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./item.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./item.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create item with type and title', async () => {
    const { default: Command } = await import('./item.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'issues',
        title: 'Test Issue',
        body: '',
        metadata: { displayNumber: 1 },
      },
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue' },
      flags: { title: 'Test Issue', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        itemType: 'issues',
        title: 'Test Issue',
      })
    )
    expect(cmd.logs.some(log => log.includes('Created issue'))).toBe(true)
  })

  it('should pluralize type correctly', async () => {
    const { default: Command } = await import('./item.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'stories',
        title: 'My Story',
        body: '',
        metadata: {},
      },
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'story' },
      flags: { title: 'My Story', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'stories' })
    )
  })

  it('should pass custom fields', async () => {
    const { default: Command } = await import('./item.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'issues',
        title: 'Test',
        body: '',
        metadata: {},
      },
    })

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

  it('should handle error response', async () => {
    const { default: Command } = await import('./item.js')
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
    const { default: Command } = await import('./item.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
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
    const { default: Command } = await import('./item.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'docs',
        title: 'A Doc',
        body: '',
        metadata: {},
      },
    })

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

  it('should not pluralize types already ending in s', async () => {
    const { default: Command } = await import('./item.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'docs',
        title: 'Test',
        body: '',
        metadata: {},
      },
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'docs' },
      flags: { title: 'Test', body: '', status: '', priority: 0 },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'docs' })
    )
  })
})
