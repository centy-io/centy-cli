import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonAddAsset = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockReadFile = vi.fn()

vi.mock('../../daemon/daemon-add-asset.js', () => ({
  daemonAddAsset: (...args: unknown[]) => mockDaemonAddAsset(...args),
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

vi.mock('node:fs/promises', () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
}))

describe('AddAsset command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
    mockReadFile.mockResolvedValue(Buffer.from('test content'))
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./asset.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./asset.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should add asset to issue', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonAddAsset.mockResolvedValue({
      success: true,
      path: '/assets/screenshot.png',
      asset: { size: 1024, mimeType: 'image/png' },
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', shared: false },
      args: { file: '/path/to/screenshot.png' },
    })

    await cmd.run()

    expect(mockDaemonAddAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        issueId: '1',
        filename: 'screenshot.png',
      })
    )
    expect(cmd.logs.some(log => log.includes('Added asset'))).toBe(true)
  })

  it('should add asset to PR', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonAddAsset.mockResolvedValue({
      success: true,
      path: '/assets/diagram.svg',
      asset: { size: 2048, mimeType: 'image/svg+xml' },
    })

    const cmd = createMockCommand(Command, {
      flags: { pr: '5' },
      args: { file: '/path/to/diagram.svg' },
    })

    await cmd.run()

    expect(mockDaemonAddAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        prId: '5',
        filename: 'diagram.svg',
      })
    )
  })

  it('should add shared asset', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonAddAsset.mockResolvedValue({
      success: true,
      path: '/assets/logo.png',
      asset: { size: 512, mimeType: 'image/png' },
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: true },
      args: { file: '/path/to/logo.png' },
    })

    await cmd.run()

    expect(mockDaemonAddAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        isShared: true,
      })
    )
  })

  it('should use custom filename when provided', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonAddAsset.mockResolvedValue({
      success: true,
      path: '/assets/custom-name.png',
      asset: { size: 1024, mimeType: 'image/png' },
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', name: 'custom-name.png' },
      args: { file: '/path/to/original.png' },
    })

    await cmd.run()

    expect(mockDaemonAddAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'custom-name.png',
      })
    )
  })

  it('should error when neither issue, pr, nor shared is specified', async () => {
    const { default: Command } = await import('./asset.js')

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { file: '/path/to/file.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Either --issue, --pr, or --shared must be specified.'
    )
  })

  it('should error when both issue and pr are specified', async () => {
    const { default: Command } = await import('./asset.js')

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', pr: '2' },
      args: { file: '/path/to/file.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Cannot specify both --issue and --pr. Choose one.'
    )
  })

  it('should handle file not found error', async () => {
    const { default: Command } = await import('./asset.js')
    mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'))

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
      args: { file: '/path/to/missing.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('File not found: /path/to/missing.png')
  })

  it('should handle daemon add asset failure', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonAddAsset.mockResolvedValue({
      success: false,
      error: 'Asset upload failed',
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
      args: { file: '/path/to/file.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Asset upload failed')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./asset.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
      args: { file: '/path/to/file.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./asset.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonAddAsset.mockResolvedValue({
      success: true,
      path: '/assets/file.png',
      asset: { size: 100, mimeType: 'image/png' },
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', project: 'other-project' },
      args: { file: '/path/to/file.png' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
