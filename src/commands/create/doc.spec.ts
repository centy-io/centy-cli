import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateDoc = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-create-doc.js', () => ({
  daemonCreateDoc: (...args: unknown[]) => mockDaemonCreateDoc(...args),
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

  it('should create doc successfully', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateDoc.mockResolvedValue({
      success: true,
      slug: 'getting-started',
      createdFile: '.centy/docs/getting-started.md',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Getting Started', content: '# Hello', json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateDoc).toHaveBeenCalledWith({
      projectPath: '/test/project',
      title: 'Getting Started',
      content: '# Hello',
      slug: undefined,
      template: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Created doc'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('getting-started'))).toBe(true)
  })

  it('should create doc with custom slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateDoc.mockResolvedValue({
      success: true,
      slug: 'my-custom-slug',
      createdFile: '.centy/docs/my-custom-slug.md',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', slug: 'my-custom-slug' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'my-custom-slug' })
    )
  })

  it('should create doc with template', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateDoc.mockResolvedValue({
      success: true,
      slug: 'api-doc',
      createdFile: '.centy/docs/api-doc.md',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'API Doc', template: 'api' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ template: 'api' })
    )
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateDoc.mockResolvedValue({
      success: false,
      error: 'Doc already exists',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc' },
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
      flags: { title: 'My Doc' },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonCreateDoc.mockResolvedValue({
      success: true,
      slug: 'test',
      createdFile: '.centy/docs/test.md',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', project: 'other-project' },
      args: {},
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonCreateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/other/project' })
    )
  })

  it('should use default empty content when not provided', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonCreateDoc.mockResolvedValue({
      success: true,
      slug: 'test',
      createdFile: '.centy/docs/test.md',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'My Doc', content: '' },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonCreateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ content: '' })
    )
  })
})
