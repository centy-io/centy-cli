import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockCreateIssue = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../../lib/create-issue/index.js', () => ({
  createIssue: (...args: unknown[]) => mockCreateIssue(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

describe('CreateIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create issue with title flag', async () => {
    const { default: Command } = await import('./issue.js')
    mockCreateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1, title: 'Test Issue' },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Test Issue' },
    })

    await cmd.run()

    expect(mockCreateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Issue',
      })
    )
  })

  it('should handle error response', async () => {
    const { default: Command } = await import('./issue.js')
    mockCreateIssue.mockResolvedValue({
      success: false,
      error: 'Failed to create issue',
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Test' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Failed to create issue')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockCreateIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 1 },
    })

    const cmd = createMockCommand(Command, {
      flags: { title: 'Test', project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })
})
