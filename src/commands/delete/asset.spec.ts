import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteAsset = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockCreateInterface = vi.fn()

vi.mock('../../daemon/daemon-delete-asset.js', () => ({
  daemonDeleteAsset: (...args: unknown[]) => mockDaemonDeleteAsset(...args),
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

vi.mock('node:readline', () => ({
  createInterface: () => mockCreateInterface(),
}))

function setupReadlineMock(answer: string) {
  mockCreateInterface.mockReturnValue({
    question: (_prompt: string, callback: (answer: string) => void) => {
      callback(answer)
    },
    close: vi.fn(),
  })
}

describe('DeleteAsset command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./asset.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should delete issue asset with force flag', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonDeleteAsset.mockResolvedValue({
      success: true,
      filename: 'test.png',
      wasShared: false,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true, issue: '1', shared: false },
      args: { filename: 'test.png' },
    })

    await cmd.run()

    expect(mockDaemonDeleteAsset).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
      filename: 'test.png',
      isShared: false,
    })
    expect(cmd.logs.some(log => log.includes('Deleted asset'))).toBe(true)
  })

  it('should delete shared asset with force flag', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonDeleteAsset.mockResolvedValue({
      success: true,
      filename: 'logo.svg',
      wasShared: true,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true, shared: true },
      args: { filename: 'logo.svg' },
    })

    await cmd.run()

    expect(mockDaemonDeleteAsset).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '',
      filename: 'logo.svg',
      isShared: true,
    })
    expect(cmd.logs.some(log => log.includes('Deleted shared asset'))).toBe(
      true
    )
  })

  it('should error when neither --issue nor --shared specified', async () => {
    const { default: Command } = await import('./asset.js')

    const cmd = createMockCommand(Command, {
      flags: { force: true, shared: false },
      args: { filename: 'test.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(
      cmd.errors.some(e =>
        e.includes('Either --issue or --shared must be specified')
      )
    ).toBe(true)
  })

  it('should delete asset after confirmation', async () => {
    const { default: Command } = await import('./asset.js')
    setupReadlineMock('y')
    mockDaemonDeleteAsset.mockResolvedValue({
      success: true,
      filename: 'test.png',
      wasShared: false,
    })

    const cmd = createMockCommand(Command, {
      flags: { force: false, issue: '1', shared: false },
      args: { filename: 'test.png' },
    })

    await cmd.run()

    expect(mockDaemonDeleteAsset).toHaveBeenCalled()
  })

  it('should cancel when user answers no', async () => {
    const { default: Command } = await import('./asset.js')
    setupReadlineMock('n')

    const cmd = createMockCommand(Command, {
      flags: { force: false, issue: '1', shared: false },
      args: { filename: 'test.png' },
    })

    await cmd.run()

    expect(mockDaemonDeleteAsset).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./asset.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true, issue: '1', shared: false },
      args: { filename: 'test.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./asset.js')
    mockDaemonDeleteAsset.mockResolvedValue({
      success: false,
      error: 'Asset not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true, issue: '1', shared: false },
      args: { filename: 'nonexistent.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Asset not found')
  })

  it('should handle non-Error throws', async () => {
    const { default: Command } = await import('./asset.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { force: true, issue: '1', shared: false },
      args: { filename: 'test.png' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })

  it('should use project flag', async () => {
    const { default: Command } = await import('./asset.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonDeleteAsset.mockResolvedValue({
      success: true,
      filename: 'test.png',
      wasShared: false,
    })

    const cmd = createMockCommand(Command, {
      flags: {
        force: true,
        issue: '1',
        shared: false,
        project: 'other-project',
      },
      args: { filename: 'test.png' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
  })
})
