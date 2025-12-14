import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetPr = vi.fn()
const mockDaemonGetPrByDisplayNumber = vi.fn()
const mockDaemonGetPrsByUuid = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-pr.js', () => ({
  daemonGetPr: (...args: unknown[]) => mockDaemonGetPr(...args),
}))

vi.mock('../../daemon/daemon-get-pr-by-display-number.js', () => ({
  daemonGetPrByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetPrByDisplayNumber(...args),
}))

vi.mock('../../daemon/daemon-get-prs-by-uuid.js', () => ({
  daemonGetPrsByUuid: (...args: unknown[]) => mockDaemonGetPrsByUuid(...args),
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
  isNotFoundError: vi.fn((e) => e?.message?.includes('not found')),
  isValidUuid: vi.fn(
    (id) => /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
  ),
}))

describe('GetPr command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./pr.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./pr.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should get PR by display number', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      displayNumber: 1,
      title: 'Add feature',
      description: 'New feature description',
      metadata: {
        status: 'open',
        priority: 2,
        priorityLabel: 'P2',
        sourceBranch: 'feature/new',
        targetBranch: 'main',
        linkedIssues: [],
        reviewers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        mergedAt: '',
        closedAt: '',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetPrByDisplayNumber).toHaveBeenCalledWith({
      projectPath: '/test/project',
      displayNumber: 1,
    })
    expect(cmd.logs.some(log => log.includes('PR #1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Add feature'))).toBe(true)
  })

  it('should get PR by UUID', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPr.mockResolvedValue({
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      displayNumber: 5,
      title: 'Fix bug',
      metadata: {
        status: 'merged',
        priority: 1,
        priorityLabel: 'P1',
        sourceBranch: 'fix/bug',
        targetBranch: 'main',
        linkedIssues: ['issue-1'],
        reviewers: ['user-1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        mergedAt: '2024-01-03T00:00:00Z',
        closedAt: '',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetPr).toHaveBeenCalledWith({
      projectPath: '/test/project',
      prId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Merged:'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./pr.js')
    const pr = {
      id: 'uuid-123',
      displayNumber: 1,
      title: 'Test PR',
      metadata: {
        status: 'open',
        priority: 2,
        priorityLabel: '',
        sourceBranch: 'test',
        targetBranch: 'main',
        linkedIssues: [],
        reviewers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        mergedAt: '',
        closedAt: '',
      },
    }
    mockDaemonGetPrByDisplayNumber.mockResolvedValue(pr)

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(pr, null, 2))
  })

  it('should search globally with --global flag', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrsByUuid.mockResolvedValue({
      prs: [
        {
          pr: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            displayNumber: 1,
            title: 'Feature PR',
            metadata: {
              status: 'open',
              priority: 2,
              priorityLabel: 'P2',
              sourceBranch: 'feat',
              targetBranch: 'main',
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
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetPrsByUuid).toHaveBeenCalledWith({
      uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 PR(s)'))).toBe(true)
  })

  it('should error on global search with display number', async () => {
    const { default: Command } = await import('./pr.js')

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('requires a valid UUID'))).toBe(true)
  })

  it('should show no results for global search', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrsByUuid.mockResolvedValue({
      prs: [],
      totalCount: 0,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No PRs found'))).toBe(true)
  })

  it('should show linked issues and reviewers', async () => {
    const { default: Command } = await import('./pr.js')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({
      id: 'uuid-123',
      displayNumber: 1,
      title: 'Test',
      metadata: {
        status: 'open',
        priority: 2,
        priorityLabel: 'P2',
        sourceBranch: 'test',
        targetBranch: 'main',
        linkedIssues: ['issue-1', 'issue-2'],
        reviewers: ['user-1', 'user-2'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        mergedAt: '',
        closedAt: '',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Linked Issues:'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Reviewers:'))).toBe(true)
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./pr.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetPrByDisplayNumber.mockResolvedValue({
      id: 'uuid',
      displayNumber: 1,
      title: 'Test',
      metadata: {
        status: 'open',
        priority: 2,
        priorityLabel: '',
        sourceBranch: 'test',
        targetBranch: 'main',
        linkedIssues: [],
        reviewers: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        mergedAt: '',
        closedAt: '',
      },
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false, project: 'other-project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })
})
