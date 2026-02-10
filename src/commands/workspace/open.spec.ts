import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonOpenInTempWorkspace = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-open-in-temp-workspace.js', () => ({
  daemonOpenInTempWorkspace: (...args: unknown[]) =>
    mockDaemonOpenInTempWorkspace(...args),
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
    mockDaemonOpenInTempWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-workspace-123',
      displayNumber: 1,
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: true,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonOpenInTempWorkspace).toHaveBeenCalledWith(
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
    mockDaemonOpenInTempWorkspace.mockResolvedValue({
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

  it('should warn when VS Code could not be opened', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      displayNumber: 1,
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: false,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('Editor'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./open.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should rethrow non-NotInitializedError', async () => {
    const { default: Command } = await import('./open.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Some other error'))

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    // eslint-disable-next-line no-restricted-syntax
    expect((error as Error).message).toBe('Some other error')
  })

  it('should show reused workspace info with originalCreatedAt', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-workspace-reused',
      displayNumber: 5,
      expiresAt: '2024-12-20T00:00:00Z',
      editorOpened: true,
      workspaceReused: true,
      originalCreatedAt: '2024-12-10T00:00:00Z',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '5' },
    })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('Reopened existing workspace'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('Originally created'))).toBe(true)
  })

  it('should show reused workspace without originalCreatedAt', async () => {
    const { default: Command } = await import('./open.js')
    mockDaemonOpenInTempWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-workspace-reused',
      displayNumber: 5,
      expiresAt: '2024-12-20T00:00:00Z',
      editorOpened: true,
      workspaceReused: true,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { issueId: '5' },
    })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('Reopened existing workspace'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('Originally created'))).toBe(false)
  })
})
