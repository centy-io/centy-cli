import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonOpenInTempVscode = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-open-in-temp-vscode.js', () => ({
  daemonOpenInTempVscode: (...args: unknown[]) =>
    mockDaemonOpenInTempVscode(...args),
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

describe('WorkspaceOpen command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./open.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./open.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should open workspace successfully', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempVscode.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-workspace-123',
      issueDisplayNumber: 1,
      issueTitle: 'Test Issue',
      expiresAt: '2024-12-15T00:00:00Z',
      vscodeOpened: true,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonOpenInTempVscode).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        issueId: '1',
        action: 'PLAN',
      })
    )
    expect(cmd.logs[0]).toContain('/tmp/centy-workspace-123')
  })

  it('should handle open error', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempVscode.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should use implement action when specified', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempVscode.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      issueDisplayNumber: 1,
      issueTitle: 'Test',
      expiresAt: '2024-12-15T00:00:00Z',
      vscodeOpened: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { action: 'implement' },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonOpenInTempVscode).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'IMPLEMENT',
      })
    )
  })

  it('should warn when VS Code could not be opened', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempVscode.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      issueDisplayNumber: 1,
      issueTitle: 'Test',
      expiresAt: '2024-12-15T00:00:00Z',
      vscodeOpened: false,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('VS Code'))).toBe(true)
  })
})
