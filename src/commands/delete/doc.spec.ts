import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockCreateInterface = vi.fn()

vi.mock('../../daemon/daemon-delete-item.js', () => ({
  daemonDeleteItem: (...args: unknown[]) => mockDaemonDeleteItem(...args),
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

vi.mock('node:readline', () => ({
  createInterface: () => mockCreateInterface(),
}))

function setupReadlineMock(answer: string) {
  mockCreateInterface.mockReturnValue({
    question: (_prompt: string, callback: (answer: string) => void) => {
      callback(answer)
    },
    close: vi.fn(),
  })
}

describe('DeleteDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should delete doc with force flag', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDeleteItem.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockDaemonDeleteItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'docs',
      itemId: 'my-doc',
      force: false,
    })
    expect(cmd.logs.some(log => log.includes('Deleted doc'))).toBe(true)
  })

  it('should delete doc after confirmation', async () => {
    const { default: Command } = await import('./doc.js')
    setupReadlineMock('y')
    mockDaemonDeleteItem.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockDaemonDeleteItem).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Deleted doc'))).toBe(true)
  })

  it('should cancel when user answers no', async () => {
    const { default: Command } = await import('./doc.js')
    setupReadlineMock('n')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockDaemonDeleteItem).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDeleteItem.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should use project flag', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonDeleteItem.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true, project: 'other-project' },
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./doc.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
