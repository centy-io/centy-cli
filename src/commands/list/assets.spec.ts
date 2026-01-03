import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListAssets = vi.fn()
const mockDaemonListSharedAssets = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-assets.js', () => ({
  daemonListAssets: (...args: unknown[]) => mockDaemonListAssets(...args),
}))

vi.mock('../../daemon/daemon-list-shared-assets.js', () => ({
  daemonListSharedAssets: (...args: unknown[]) =>
    mockDaemonListSharedAssets(...args),
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

function createMockAsset(overrides: Record<string, unknown> = {}) {
  return {
    filename: 'test.png',
    size: 1024,
    mimeType: 'image/png',
    isShared: false,
    ...overrides,
  }
}

describe('ListAssets command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./assets.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./assets.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list issue assets', async () => {
    const { default: Command } = await import('./assets.js')
    mockDaemonListAssets.mockResolvedValue({
      assets: [
        createMockAsset({ filename: 'screenshot.png', size: 2048 }),
        createMockAsset({
          filename: 'diagram.svg',
          size: 512,
          mimeType: 'image/svg+xml',
        }),
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
    })
    await cmd.run()

    expect(mockDaemonListAssets).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        issueId: '1',
      })
    )
    expect(cmd.logs.some(log => log.includes('Found 2 asset(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('screenshot.png'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('diagram.svg'))).toBe(true)
  })

  it('should list shared assets', async () => {
    const { default: Command } = await import('./assets.js')
    mockDaemonListSharedAssets.mockResolvedValue({
      assets: [createMockAsset({ filename: 'logo.png', isShared: true })],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { shared: true },
    })
    await cmd.run()

    expect(mockDaemonListSharedAssets).toHaveBeenCalledWith({
      projectPath: '/test/project',
    })
    expect(cmd.logs.some(log => log.includes('Found 1 asset(s)'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('logo.png'))).toBe(true)
  })

  it('should include shared assets when flag is set', async () => {
    const { default: Command } = await import('./assets.js')
    mockDaemonListAssets.mockResolvedValue({
      assets: [
        createMockAsset({ filename: 'local.png', isShared: false }),
        createMockAsset({ filename: 'shared.png', isShared: true }),
      ],
      totalCount: 2,
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', 'include-shared': true },
    })
    await cmd.run()

    expect(mockDaemonListAssets).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
      includeShared: true,
    })
    expect(cmd.logs.some(log => log.includes('[shared]'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./assets.js')
    const assets = [createMockAsset({ filename: 'test.png' })]
    mockDaemonListAssets.mockResolvedValue({
      assets,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', json: true },
    })
    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(assets, null, 2))
  })

  it('should show message when no assets found', async () => {
    const { default: Command } = await import('./assets.js')
    mockDaemonListAssets.mockResolvedValue({
      assets: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
    })
    await cmd.run()

    expect(cmd.logs).toContain('No assets found.')
  })

  it('should error when neither --issue nor --shared is specified', async () => {
    const { default: Command } = await import('./assets.js')

    const cmd = createMockCommand(Command, {
      flags: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain(
      'Either --issue or --shared must be specified.'
    )
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./assets.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./assets.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListAssets.mockResolvedValue({
      assets: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1', project: 'other' },
    })
    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })

  it('should display asset details correctly', async () => {
    const { default: Command } = await import('./assets.js')
    mockDaemonListAssets.mockResolvedValue({
      assets: [
        createMockAsset({
          filename: 'image.png',
          size: 1024,
          mimeType: 'image/png',
        }),
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { issue: '1' },
    })
    await cmd.run()

    expect(cmd.logs.some(log => log.includes('1024 bytes'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('image/png'))).toBe(true)
  })
})
