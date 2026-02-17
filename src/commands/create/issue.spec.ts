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

describe('CreateIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create issue with title flag via generic createItem', async () => {
    const { default: Command } = await import('./issue.js')
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
      flags: {
        title: 'Test Issue',
        description: '',
        status: 'open',
        draft: false,
        org: false,
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        itemType: 'issues',
        title: 'Test Issue',
      })
    )
  })

  it('should handle error response', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: false,
      error: 'Failed to create issue',
    })

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'Test',
        description: '',
        status: 'open',
        draft: false,
        org: false,
      },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Failed to create issue')
  })

  it('should pass org flag as customField', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'issues',
        title: 'Org Issue',
        body: '',
        metadata: { displayNumber: 1 },
      },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'Org Issue',
        description: '',
        status: 'open',
        draft: false,
        org: true,
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        customFields: expect.objectContaining({ isOrgIssue: 'true' }),
      })
    )
  })

  it('should pass draft flag as customField', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'issues',
        title: 'Draft Issue',
        body: '',
        metadata: {},
      },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'Draft Issue',
        description: '',
        status: 'open',
        draft: true,
        org: false,
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        customFields: expect.objectContaining({ draft: 'true' }),
      })
    )
  })

  it('should convert priority string to number', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'abc-123',
        itemType: 'issues',
        title: 'High Priority',
        body: '',
        metadata: { displayNumber: 1 },
      },
    })

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'High Priority',
        description: '',
        priority: 'high',
        status: 'open',
        draft: false,
        org: false,
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 1 })
    )
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
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
      flags: {
        title: 'Test',
        description: '',
        status: 'open',
        draft: false,
        org: false,
        project: 'other-project',
      },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'Test',
        description: '',
        status: 'open',
        draft: false,
        org: false,
      },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })
})
