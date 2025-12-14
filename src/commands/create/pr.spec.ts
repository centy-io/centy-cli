import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockCreatePr = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../../lib/create-pr/index.js', () => ({
  createPr: (...args: unknown[]) => mockCreatePr(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

describe('CreatePr command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
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

  it('should create PR with all flags', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: {
        title: 'Add feature',
        description: 'A detailed description',
        source: 'feature-branch',
        target: 'main',
        issues: '1, 2, 3',
        reviewers: 'alice, bob',
        priority: 'high',
        status: 'draft',
      },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith({
      cwd: '/test/project',
      title: 'Add feature',
      description: 'A detailed description',
      sourceBranch: 'feature-branch',
      targetBranch: 'main',
      linkedIssues: ['1', '2', '3'],
      reviewers: ['alice', 'bob'],
      priority: 'high',
      status: 'draft',
    })
  })

  it('should create PR with minimal flags', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Simple PR' },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith({
      cwd: '/test/project',
      title: 'Simple PR',
      description: undefined,
      sourceBranch: undefined,
      targetBranch: undefined,
      linkedIssues: undefined,
      reviewers: undefined,
      priority: undefined,
      status: undefined,
    })
  })

  it('should create PR without any flags', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: {},
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith({
      cwd: '/test/project',
      title: undefined,
      description: undefined,
      sourceBranch: undefined,
      targetBranch: undefined,
      linkedIssues: undefined,
      reviewers: undefined,
      priority: undefined,
      status: undefined,
    })
  })

  it('should parse linked issues from comma-separated string', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { issues: 'issue-1,issue-2,issue-3' },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedIssues: ['issue-1', 'issue-2', 'issue-3'],
      })
    )
  })

  it('should parse reviewers from comma-separated string', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { reviewers: 'alice,bob,charlie' },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewers: ['alice', 'bob', 'charlie'],
      })
    )
  })

  it('should handle createPr failure', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({
      success: false,
      error: 'Failed to create PR',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Test PR' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Failed to create PR')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./pr.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Test', project: 'other-project' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockCreatePr).toHaveBeenCalledWith(
      expect.objectContaining({
        cwd: '/other/project',
      })
    )
  })

  it('should pass medium priority', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { priority: 'medium' },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'medium' })
    )
  })

  it('should pass low priority', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { priority: 'low' },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'low' })
    )
  })

  it('should pass open status', async () => {
    const { default: Command } = await import('./pr.js')
    mockCreatePr.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { status: 'open' },
    })
    await cmd.run()

    expect(mockCreatePr).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'open' })
    )
  })
})
