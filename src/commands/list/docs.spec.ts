import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListDocs = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-docs.js', () => ({
  daemonListDocs: (...args: unknown[]) => mockDaemonListDocs(...args),
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

function createMockDoc(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'test-doc',
    title: 'Test Document',
    content: 'Test content',
    ...overrides,
  }
}

describe('ListDocs command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./docs.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./docs.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list all docs', async () => {
    const { default: Command } = await import('./docs.js')
    mockDaemonListDocs.mockResolvedValue({
      docs: [
        createMockDoc({ slug: 'readme', title: 'README' }),
        createMockDoc({ slug: 'contributing', title: 'Contributing Guide' }),
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })
    await cmd.run()

    expect(mockDaemonListDocs).toHaveBeenCalledWith({
      projectPath: '/test/project',
    })
    expect(cmd.logs.some(log => log.includes('Found 2 doc(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('readme: README'))).toBe(true)
    expect(
      cmd.logs.some(log => log.includes('contributing: Contributing Guide'))
    ).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./docs.js')
    const docs = [createMockDoc({ slug: 'test', title: 'Test' })]
    mockDaemonListDocs.mockResolvedValue({
      docs,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })
    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(docs, null, 2))
  })

  it('should show message when no docs found', async () => {
    const { default: Command } = await import('./docs.js')
    mockDaemonListDocs.mockResolvedValue({
      docs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })
    await cmd.run()

    expect(cmd.logs).toContain('No docs found.')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./docs.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./docs.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListDocs.mockResolvedValue({
      docs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
