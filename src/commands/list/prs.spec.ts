import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListPrs = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-prs.js', () => ({
  daemonListPrs: (...args: unknown[]) => mockDaemonListPrs(...args),
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

describe('ListPrs command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./prs.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./prs.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list all PRs', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [
        {
          id: 'pr-1',
          displayNumber: 1,
          title: 'Add feature',
          metadata: {
            status: 'open',
            priority: 2,
            priorityLabel: 'P2',
            sourceBranch: 'feature/new',
            targetBranch: 'main',
          },
        },
        {
          id: 'pr-2',
          displayNumber: 2,
          title: 'Fix bug',
          metadata: {
            status: 'merged',
            priority: 1,
            priorityLabel: '',
            sourceBranch: 'fix/bug',
            targetBranch: 'main',
          },
        },
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
    })

    await cmd.run()

    expect(mockDaemonListPrs).toHaveBeenCalledWith({
      projectPath: '/test/project',
      status: undefined,
      sourceBranch: undefined,
      targetBranch: undefined,
      priority: undefined,
    })
    expect(cmd.logs.some(log => log.includes('Found 2 PR(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Add feature'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('feature/new -> main'))).toBe(true)
  })

  it('should filter by status', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { status: 'open', json: false },
    })

    await cmd.run()

    expect(mockDaemonListPrs).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'open',
      })
    )
  })

  it('should filter by source branch', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { source: 'feature/test', json: false },
    })

    await cmd.run()

    expect(mockDaemonListPrs).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceBranch: 'feature/test',
      })
    )
  })

  it('should filter by target branch', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { target: 'develop', json: false },
    })

    await cmd.run()

    expect(mockDaemonListPrs).toHaveBeenCalledWith(
      expect.objectContaining({
        targetBranch: 'develop',
      })
    )
  })

  it('should filter by priority', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { priority: 1, json: false },
    })

    await cmd.run()

    expect(mockDaemonListPrs).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 1,
      })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./prs.js')
    const prs = [{ id: 'pr-1', displayNumber: 1, title: 'Test PR' }]
    mockDaemonListPrs.mockResolvedValue({
      prs,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(prs, null, 2))
  })

  it('should show message when no PRs found', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No pull requests found'))).toBe(
      true
    )
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./prs.js')
    const { NotInitializedError } = await import(
      '../../utils/ensure-initialized.js'
    )
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./prs.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListPrs.mockResolvedValue({
      prs: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other-project', json: false },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })

  it('should handle PRs without priorityLabel', async () => {
    const { default: Command } = await import('./prs.js')
    mockDaemonListPrs.mockResolvedValue({
      prs: [
        {
          id: 'pr-1',
          displayNumber: 1,
          title: 'Test',
          metadata: {
            status: 'open',
            priority: 3,
            priorityLabel: '',
            sourceBranch: 'test',
            targetBranch: 'main',
          },
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('[P3]'))).toBe(true)
  })
})
