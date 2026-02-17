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

describe('CreateDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create doc via generic createItem', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'getting-started',
        itemType: 'docs',
        title: 'Getting Started',
        body: '# Hello',
        metadata: {},
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Getting Started', body: '# Hello' },
      args: {},
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
    expect(cmd.logs.some(log => log.includes('getting-started'))).toBe(true)
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: false,
      error: 'Doc already exists',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', body: '' },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc already exists')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', body: '' },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'test',
        itemType: 'docs',
        title: 'My Doc',
        body: '',
        metadata: {},
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', body: '', project: 'other-project' },
      args: {},
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })

  it('should use default empty body when not provided', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateItem.mockResolvedValue({
      success: true,
      item: {
        id: 'test',
        itemType: 'docs',
        title: 'My Doc',
        body: '',
        metadata: {},
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', body: '' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({ body: '' })
    )
  })
})
