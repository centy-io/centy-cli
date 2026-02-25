import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonOpenStandaloneWorkspace = vi.fn()
const mockDaemonGetSupportedEditors = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockResolveEditorId = vi.fn()

vi.mock('../../daemon/daemon-open-standalone-workspace.js', () => ({
  daemonOpenStandaloneWorkspace: (...args: unknown[]) =>
    mockDaemonOpenStandaloneWorkspace(...args),
}))

vi.mock('../../daemon/daemon-get-supported-editors.js', () => ({
  daemonGetSupportedEditors: (...args: unknown[]) =>
    mockDaemonGetSupportedEditors(...args),
}))

vi.mock('../../lib/workspace/resolve-editor-id.js', () => ({
  resolveEditorId: (...args: unknown[]) => mockResolveEditorId(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

const defaultEditors = [
  {
    editorId: 'vscode',
    name: 'VS Code',
    description: 'Visual Studio Code',
    available: true,
    terminalWrapper: false,
  },
]

describe('WorkspaceNew command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockDaemonGetSupportedEditors.mockResolvedValue({ editors: defaultEditors })
    mockResolveEditorId.mockResolvedValue('vscode')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./new.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./new.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create a standalone workspace successfully', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-standalone-workspace-123',
      workspaceId: 'uuid-123',
      name: '',
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: true,
    })

    const cmd = createMockCommand(Command, { flags: {} })

    await cmd.run()

    expect(mockDaemonGetSupportedEditors).toHaveBeenCalledWith({})
    expect(mockDaemonOpenStandaloneWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        name: '',
        description: '',
        ttlHours: 0,
        agentName: '',
        editorId: 'vscode',
      })
    )
    expect(cmd.logs[0]).toContain('/tmp/centy-standalone-workspace-123')
  })

  it('should pass editor flag to resolveEditorId', async () => {
    const { default: Command } = await import('./new.js')
    mockResolveEditorId.mockResolvedValue('terminal')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      workspaceId: 'uuid-456',
      name: '',
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { editor: 'terminal' },
    })

    await cmd.run()

    expect(mockResolveEditorId).toHaveBeenCalledWith('terminal', defaultEditors)
    expect(mockDaemonOpenStandaloneWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({ editorId: 'terminal' })
    )
  })

  it('should error if resolveEditorId throws', async () => {
    const { default: Command } = await import('./new.js')
    mockResolveEditorId.mockRejectedValue(new Error('Editor "zed" is not available. Available editors: vscode'))

    const cmd = createMockCommand(Command, {
      flags: { editor: 'zed' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Editor "zed" is not available. Available editors: vscode')
  })

  it('should pass name and description flags', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      workspaceId: 'uuid-456',
      name: 'my-workspace',
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { name: 'my-workspace', description: 'explore auth' },
    })

    await cmd.run()

    expect(mockDaemonOpenStandaloneWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my-workspace',
        description: 'explore auth',
      })
    )
    expect(cmd.logs.some(l => l.includes('my-workspace'))).toBe(true)
  })

  it('should pass ttl and agent flags', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      workspaceId: 'uuid-789',
      name: '',
      expiresAt: '2024-12-20T00:00:00Z',
      editorOpened: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { ttl: 24, agent: 'claude' },
    })

    await cmd.run()

    expect(mockDaemonOpenStandaloneWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        ttlHours: 24,
        agentName: 'claude',
      })
    )
  })

  it('should handle daemon error', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: false,
      error: 'Daemon unavailable',
    })

    const cmd = createMockCommand(Command, { flags: {} })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Daemon unavailable')
  })

  it('should warn when editor could not be opened', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/workspace',
      workspaceId: 'uuid-123',
      name: '',
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: false,
    })

    const cmd = createMockCommand(Command, { flags: {} })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('Editor'))).toBe(true)
  })

  it('should show reused workspace info with originalCreatedAt', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-workspace-reused',
      workspaceId: 'uuid-reused',
      name: '',
      expiresAt: '2024-12-20T00:00:00Z',
      editorOpened: true,
      workspaceReused: true,
      originalCreatedAt: '2024-12-10T00:00:00Z',
    })

    const cmd = createMockCommand(Command, { flags: {} })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('Reopened existing workspace'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('Originally created'))).toBe(true)
  })

  it('should show reused workspace without originalCreatedAt', async () => {
    const { default: Command } = await import('./new.js')
    mockDaemonOpenStandaloneWorkspace.mockResolvedValue({
      success: true,
      workspacePath: '/tmp/centy-workspace-reused',
      workspaceId: 'uuid-reused',
      name: '',
      expiresAt: '2024-12-20T00:00:00Z',
      editorOpened: true,
      workspaceReused: true,
    })

    const cmd = createMockCommand(Command, { flags: {} })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('Reopened existing workspace'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('Originally created'))).toBe(false)
  })
})
