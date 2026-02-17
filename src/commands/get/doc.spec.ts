import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetItem = vi.fn()
const mockDaemonGetDocsBySlug = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
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

function createMockGenericDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: 'getting-started',
    itemType: 'docs',
    title: 'Getting Started',
    body: '# Getting Started\n\nWelcome!',
    metadata: {
      displayNumber: 0,
      status: '',
      priority: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

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
    const item = createMockGenericDoc()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { slug: 'getting-started' },
    })

    await cmd.run()

    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/test/project',
      itemType: 'docs',
      itemId: 'getting-started',
    })
    expect(cmd.logs.some(log => log.includes('Title: Getting Started'))).toBe(
      true
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./doc.js')
    const item = createMockGenericDoc()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { slug: 'api-docs' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(item, null, 2))
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
    const item = createMockGenericDoc()
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false, project: 'other-project' },
      args: { slug: 'test' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })

  it('should handle daemon get item failure', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonGetItem.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { slug: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should show doc with undefined metadata', async () => {
    const { default: Command } = await import('./doc.js')
    const item = createMockGenericDoc({ metadata: undefined })
    mockDaemonGetItem.mockResolvedValue({ success: true, item })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { slug: 'test' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('unknown'))).toBe(true)
  })

  it('should display global docs with content and errors', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonGetDocsBySlug.mockResolvedValue({
      docs: [
        {
          doc: {
            title: 'Test',
            slug: 'test',
            content: '# Content here',
            metadata: undefined,
          },
          projectName: 'proj-a',
          projectPath: '/proj/a',
        },
      ],
      totalCount: 1,
      errors: ['Failed project-b'],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { slug: 'test' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Content here'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('unknown'))).toBe(true)
    expect(cmd.warnings.some(w => w.includes('Some projects could not'))).toBe(
      true
    )
  })

  it('should handle not initialized error with search result', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    const { handleNotInitializedWithSearch } =
      await import('../../utils/cross-project-search.js')
    const mockHandleNotInit = vi.mocked(handleNotInitializedWithSearch)
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Not initialized')
    )
    mockHandleNotInit.mockResolvedValue({
      message: 'doc test found in: other-project',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { slug: 'test' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('doc test found in: other-project')
  })

  it('should handle not initialized error with json search result', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    const { handleNotInitializedWithSearch } =
      await import('../../utils/cross-project-search.js')
    const mockHandleNotInit = vi.mocked(handleNotInitializedWithSearch)
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Not initialized')
    )
    mockHandleNotInit.mockResolvedValue({
      message: 'found elsewhere',
      jsonOutput: { found: true },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { slug: 'test' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.logs.some(log => log.includes('"found"'))).toBe(true)
  })
})
