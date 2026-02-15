import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonCreateLink = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-create-link.js', () => ({
  daemonCreateLink: (...args: unknown[]) => mockDaemonCreateLink(...args),
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

describe('Link command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./link.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./link.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create a link between two issues', async () => {
    const { default: Command } = await import('./link.js')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1', linkType: 'blocks', target: 'issue:2' },
    })

    await cmd.run()

    expect(mockDaemonCreateLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: '1',
      sourceType: 'issue',
      targetId: '2',
      targetType: 'issue',
      linkType: 'blocks',
    })
    expect(cmd.logs.some(log => log.includes('Created link'))).toBe(true)
  })

  it('should create a link from doc to issue', async () => {
    const { default: Command } = await import('./link.js')
    mockDaemonCreateLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: {
        type: 'doc',
        id: 'getting-started',
        linkType: 'relates-to',
        target: 'issue:5',
      },
    })

    await cmd.run()

    expect(mockDaemonCreateLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      sourceId: 'getting-started',
      sourceType: 'doc',
      targetId: '5',
      targetType: 'issue',
      linkType: 'relates-to',
    })
  })

  it('should error on invalid target format', async () => {
    const { default: Command } = await import('./link.js')

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1', linkType: 'blocks', target: 'invalid' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
    )
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./link.js')
    mockDaemonCreateLink.mockResolvedValue({
      success: false,
      error: 'Link already exists',
    })

    const cmd = createMockCommand(Command, {
      args: { type: 'issue', id: '1', linkType: 'blocks', target: 'issue:2' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Link already exists')
  })
})
