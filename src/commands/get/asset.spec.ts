import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonGetAsset = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockWriteFile = vi.fn()

vi.mock('../../daemon/daemon-get-asset.js', () => ({
  daemonGetAsset: (...args: unknown[]) => mockDaemonGetAsset(...args),
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
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}))

describe('GetAsset command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
    mockWriteFile.mockResolvedValue(undefined)
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

  it('should have show:asset alias', async () => {
    const { default: Command } = await import('./asset.js')
    expect(Command.aliases).toContain('show:asset')
  })

  it('should get an issue asset and save to file', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonGetAsset.mockResolvedValue({
      success: true,
      data: Buffer.from('test data'),
      asset: {
        filename: 'screenshot.png',
        size: 1024,
        mimeType: 'image/png',
      },
    })

    const cmd = createMockCommand(Command, {
      args: { filename: 'screenshot.png' },
      flags: { issue: '1', shared: false },
    })
    await cmd.run()

    expect(mockDaemonGetAsset).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
      filename: 'screenshot.png',
      isShared: false,
    })
    expect(mockWriteFile).toHaveBeenCalledWith(
      'screenshot.png',
      expect.any(Buffer)
    )
    expect(
      cmd.logs.some(log => log.includes('Saved asset to screenshot.png'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('1024 bytes'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('image/png'))).toBe(true)
  })

  it('should get a shared asset', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonGetAsset.mockResolvedValue({
      success: true,
      data: Buffer.from('logo data'),
      asset: {
        filename: 'logo.svg',
        size: 512,
        mimeType: 'image/svg+xml',
      },
    })

    const cmd = createMockCommand(Command, {
      args: { filename: 'logo.svg' },
      flags: { shared: true },
    })
    await cmd.run()

    expect(mockDaemonGetAsset).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: undefined,
      filename: 'logo.svg',
      isShared: true,
    })
  })

  it('should use custom output path when specified', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonGetAsset.mockResolvedValue({
      success: true,
      data: Buffer.from('test data'),
      asset: {
        filename: 'screenshot.png',
        size: 1024,
        mimeType: 'image/png',
      },
    })

    const cmd = createMockCommand(Command, {
      args: { filename: 'screenshot.png' },
      flags: { issue: '1', output: './output/my-screenshot.png' },
    })
    await cmd.run()

    expect(mockWriteFile).toHaveBeenCalledWith(
      './output/my-screenshot.png',
      expect.any(Buffer)
    )
    expect(
      cmd.logs.some(log =>
        log.includes('Saved asset to ./output/my-screenshot.png')
      )
    ).toBe(true)
  })

  it('should error when neither --issue nor --shared is specified', async () => {
    const { default: Command } = await import('./asset.js')

    const cmd = createMockCommand(Command, {
      args: { filename: 'test.png' },
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Either --issue or --shared must be specified.'
    )
  })

  it('should handle daemon get asset failure', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonGetAsset.mockResolvedValue({
      success: false,
      error: 'Asset not found',
    })

    const cmd = createMockCommand(Command, {
      args: { filename: 'missing.png' },
      flags: { issue: '1' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Asset not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./asset.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      args: { filename: 'test.png' },
      flags: { issue: '1' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./asset.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonGetAsset.mockResolvedValue({
      success: true,
      data: Buffer.from('test'),
      asset: { filename: 'test.png', size: 100, mimeType: 'image/png' },
    })

    const cmd = createMockCommand(Command, {
      args: { filename: 'test.png' },
      flags: { issue: '1', project: 'other' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other')
  })
})
