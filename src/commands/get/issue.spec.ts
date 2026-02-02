import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'
import GetIssue from './issue.js'

const mockDaemonGetIssue = vi.fn()
const mockDaemonGetIssueByDisplayNumber = vi.fn()
const mockDaemonGetIssuesByUuid = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-issue.js', () => ({
  daemonGetIssue: (...args: unknown[]) => mockDaemonGetIssue(...args),
}))

vi.mock('../../daemon/daemon-get-issue-by-display-number.js', () => ({
  daemonGetIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetIssueByDisplayNumber(...args),
}))

vi.mock('../../daemon/daemon-get-issues-by-uuid.js', () => ({
  daemonGetIssuesByUuid: (...args: unknown[]) =>
    mockDaemonGetIssuesByUuid(...args),
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
  isValidUuid: vi.fn(id =>
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
  ),
}))

function createMockIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    displayNumber: 1,
    title: 'Test Issue',
    description: 'Test description',
    metadata: {
      status: 'open',
      priority: 1,
      priorityLabel: 'P1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    ...overrides,
  }
}

describe('GetIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct aliases', () => {
    expect(GetIssue.aliases).toContain('issue')
    expect(GetIssue.aliases).toContain('show:issue')
  })

  it('should get issue by display number', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssueByDisplayNumber.mockResolvedValue(createMockIssue())

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonGetIssueByDisplayNumber).toHaveBeenCalledWith({
      projectPath: '/test/project',
      displayNumber: 1,
    })
    expect(cmd.logs.some(log => log.includes('Issue #1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Test Issue'))).toBe(true)
  })

  it('should get issue by UUID', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssue.mockResolvedValue(createMockIssue())

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetIssue).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issue.js')
    const issue = createMockIssue()
    mockDaemonGetIssueByDisplayNumber.mockResolvedValue(issue)

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(issue, null, 2))
  })

  it('should search globally with --global flag', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [
        {
          issue: createMockIssue(),
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

    expect(mockDaemonGetIssuesByUuid).toHaveBeenCalledWith({
      uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 issue(s)'))).toBe(true)
  })

  it('should error on global search with display number', async () => {
    const { default: Command } = await import('./issue.js')

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('requires a valid UUID'))).toBe(true)
  })

  it('should show no results for global search', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [],
      totalCount: 0,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No issues found'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetIssueByDisplayNumber.mockResolvedValue(createMockIssue())

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false, project: 'other-project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })

  it('should show issue description', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssueByDisplayNumber.mockResolvedValue(
      createMockIssue({ description: 'A detailed description' })
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: false },
      args: { id: '1' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Description:'))).toBe(true)
  })

  it('should show errors from global search', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [],
      totalCount: 0,
      errors: ['Failed to search project-b'],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false, global: true },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('Some projects could not'))).toBe(
      true
    )
  })

  it('should output JSON for global search', async () => {
    const { default: Command } = await import('./issue.js')
    const result = {
      issues: [
        {
          issue: createMockIssue(),
          projectName: 'proj',
          projectPath: '/proj',
        },
      ],
      totalCount: 1,
      errors: [],
    }
    mockDaemonGetIssuesByUuid.mockResolvedValue(result)

    const cmd = createMockCommand(Command, {
      flags: { json: true, global: true },
      args: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(result, null, 2))
  })
})

describe('get issue command - ID parsing', () => {
  describe('isDisplayNumber detection', () => {
    it('should treat pure numeric strings as display numbers', () => {
      const isAllDigits = (id: string) => /^\d+$/.test(id)

      expect(isAllDigits('1')).toBe(true)
      expect(isAllDigits('37')).toBe(true)
      expect(isAllDigits('123')).toBe(true)
    })

    it('should NOT treat UUIDs starting with digits as display numbers', () => {
      const isAllDigits = (id: string) => /^\d+$/.test(id)

      expect(isAllDigits('3981508f-1961-4174-a421-bba3a8a6a538')).toBe(false)
    })
  })

  describe('command aliases', () => {
    it('should have "issue" alias', () => {
      expect(GetIssue.aliases).toContain('issue')
    })

    it('should have "show:issue" alias', () => {
      expect(GetIssue.aliases).toContain('show:issue')
    })
  })
})
