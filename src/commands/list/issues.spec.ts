import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListIssues = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-issues.js', () => ({
  daemonListIssues: (...args: unknown[]) => mockDaemonListIssues(...args),
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

describe('ListIssues command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list issues with default options', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [
        { displayNumber: 1, title: 'Issue 1', status: 'open' },
        { displayNumber: 2, title: 'Issue 2', status: 'closed' },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(mockEnsureInitialized).toHaveBeenCalledWith('/test/project')
    expect(mockDaemonListIssues).toHaveBeenCalled()
  })

  it('should filter by status', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [{ displayNumber: 1, title: 'Issue 1', status: 'open' }],
    })

    const cmd = createMockCommand(Command, {
      flags: { status: 'open' },
    })

    await cmd.run()

    expect(mockDaemonListIssues).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'open',
      })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issues.js')
    const issues = [{ displayNumber: 1, title: 'Test', status: 'open' }]
    mockDaemonListIssues.mockResolvedValue({ issues })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(issues, null, 2))
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issues.js')
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
    const { default: Command } = await import('./issues.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListIssues.mockResolvedValue({ issues: [] })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })

  it('should display no issues found message', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({ issues: [], totalCount: 0 })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No issues found'))).toBe(true)
  })

  it('should display formatted output with metadata', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [
        {
          displayNumber: 1,
          title: 'Issue with metadata',
          metadata: { priority: 1, priorityLabel: 'High', status: 'open', draft: false },
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('#1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('[High]'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('[open]'))).toBe(true)
  })

  it('should use P{priority} when priorityLabel is empty', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [
        {
          displayNumber: 2,
          title: 'Issue without label',
          metadata: { priority: 2, priorityLabel: '', status: 'in-progress', draft: false },
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('[P2]'))).toBe(true)
  })

  it('should show P? when no metadata', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [
        {
          displayNumber: 3,
          title: 'Issue without metadata',
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('[P?]'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('[unknown]'))).toBe(true)
  })

  it('should show draft indicator for draft issues', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [
        {
          displayNumber: 4,
          title: 'Draft issue',
          metadata: { priority: 1, priorityLabel: 'High', status: 'open', draft: true },
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('[DRAFT]'))).toBe(true)
  })

  it('should filter by priority', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [{ displayNumber: 1, title: 'High priority' }],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { priority: 1 },
    })

    await cmd.run()

    expect(mockDaemonListIssues).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 1 })
    )
  })

  it('should filter by draft status', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { draft: true },
    })

    await cmd.run()

    expect(mockDaemonListIssues).toHaveBeenCalledWith(
      expect.objectContaining({ draft: true })
    )
  })

  it('should handle generic error during ensureInitialized', async () => {
    const { default: Command } = await import('./issues.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Generic error'))

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await expect(cmd.run()).rejects.toThrow('Generic error')
  })

  it('should handle non-Error throws in ensureInitialized', async () => {
    const { default: Command } = await import('./issues.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await expect(cmd.run()).rejects.toThrow('string error')
  })
})
