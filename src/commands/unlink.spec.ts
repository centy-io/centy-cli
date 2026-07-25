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

  it('should remove a link by ID', async () => {
    const { default: Command } = await import('./unlink.js')
    mockDaemonDeleteLink.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      args: { linkId: 'abc-123-uuid' },
      flags: {},
    })

    await cmd.run()

    expect(mockDaemonDeleteLink).toHaveBeenCalledWith({
      projectPath: '/test/project',
      linkId: 'abc-123-uuid',
    })
    expect(cmd.logs.some(log => log.includes('Removed link'))).toBe(true)
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./unlink.js')
    mockDaemonDeleteLink.mockResolvedValue({
      success: false,
      error: 'Link not found',
    })

    const cmd = createMockCommand(Command, {
      args: { linkId: 'abc-123-uuid' },
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Link not found')
  })
})
