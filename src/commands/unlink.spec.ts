import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonDeleteLink = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-delete-link.js', () => ({
  daemonDeleteLink: (...args: unknown[]) => mockDaemonDeleteLink(...args),
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

describe('Unlink command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./unlink.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should remove a link without type filter', async () => {
    const { default: Command } = await import('./unlink.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: true,
      deletedCount: 2,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1', target: 'issue:2' },
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonDeleteLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: '1',
      sourceType: 'issue',
      targetId: '2',
      targetType: 'issue',
      linkType: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Removed 2 link(s)'))).toBe(true)
  })

  it('should remove a link with type filter', async () => {
    const { default: Command } = await import('./unlink.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: true,
      deletedCount: 1,
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'doc', id: 'arch', target: 'issue:5' },
      flags: { type: 'blocks' },
    })

    await cmd.run()

    expect(mockDaemonDeleteLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: 'arch',
      sourceType: 'doc',
      targetId: '5',
      targetType: 'issue',
      linkType: 'blocks',
    })
  })

  it('should error on invalid target format', async () => {
    const { default: Command } = await import('./unlink.js')

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1', target: 'invalid' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
    )
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./unlink.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: false,
      error: 'Link not found',
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1', target: 'issue:2' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Link not found')
  })
})
