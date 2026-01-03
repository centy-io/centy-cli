import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetDoc = vi.fn()
const mockDaemonGetDocsBySlug = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-doc.js', () => ({
  daemonGetDoc: (...args: unknown[]) => mockDaemonGetDoc(...args),
}))

vi.mock('../../daemon/daemon-get-docs-by-slug.js', () => ({
  daemonGetDocsBySlug: (...args: unknown[]) => mockDaemonGetDocsBySlug(...args),
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

vi.mock('../../utils/cross-project-search.js', () => ({
  formatCrossProjectHint: vi.fn(
    (type, id, matches) =>
      `${type} ${id} found in: ${matches.map((m: { projectName: string }) => m.projectName).join(', ')}`
  ),
  formatCrossProjectJson: vi.fn((type, id, matches) => ({
    type,
    id,
    matches,
  })),
  handleNotInitializedWithSearch: vi.fn().mockResolvedValue(null),
  isNotFoundError: vi.fn(e => {
    if (e === null || e === undefined) return false
    if (typeof e !== 'object') return false
    const err = e
    if (!('message' in err)) return false
    const message = err.message
    if (typeof message !== 'string') return false
    return message.includes('not found')
  }),
}))

describe('GetDoc command', () => {
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

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should get doc by slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonGetDoc.mockResolvedValue({
      title: 'Getting Started',
      slug: 'getting-started',
      content: '# Getting Started\n\nWelcome!',
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { slug: 'getting-started' },
    })

    await cmd.run()

    expect(mockDaemonGetDoc).toHaveBeenCalledWith({
      projectPath: '/test/project',
      slug: 'getting-started',
    })
    expect(cmd.logs.some(log => log.includes('Title: Getting Started'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('Slug: getting-started'))).toBe(
      true
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./doc.js')
    const doc = {
      title: 'API Docs',
      slug: 'api-docs',
      content: '# API',
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    }
    mockDaemonGetDoc.mockResolvedValue(doc)

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { slug: 'api-docs' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(doc, null, 2))
  })

  it('should search globally with --global flag', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonGetDocsBySlug.mockResolvedValue({
      docs: [
        {
          doc: {
            title: 'Getting Started',
            slug: 'getting-started',
            content: '# Welcome',
            metadata: {
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
      args: { slug: 'getting-started' },
    })

    await cmd.run()

    expect(mockDaemonGetDocsBySlug).toHaveBeenCalledWith({
      slug: 'getting-started',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 doc(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('project-a'))).toBe(true)
  })

  it('should show no results message for global search', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonGetDocsBySlug.mockResolvedValue({
      docs: [],
      totalCount: 0,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { slug: 'nonexistent' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No docs found'))).toBe(true)
  })

  it('should output JSON for global search', async () => {
    const { default: Command } = await import('./doc.js')
    const result = {
      docs: [
        {
          doc: { title: 'Test', slug: 'test', content: '' },
          projectName: 'proj',
          projectPath: '/proj',
        },
      ],
      totalCount: 1,
      errors: [],
    }
    mockDaemonGetDocsBySlug.mockResolvedValue(result)

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: true },
      args: { slug: 'test' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(result, null, 2))
  })

  it('should show errors from global search', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonGetDocsBySlug.mockResolvedValue({
      docs: [],
      totalCount: 0,
      errors: ['Failed to search project-b'],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { slug: 'test' },
    })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('Some projects could not'))).toBe(
      true
    )
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetDoc.mockResolvedValue({
      title: 'Test',
      slug: 'test',
      content: '',
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false, project: 'other-project' },
      args: { slug: 'test' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
