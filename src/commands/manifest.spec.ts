import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetManifest = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-manifest.js', () => ({
  daemonGetManifest: (...args: unknown[]) => mockDaemonGetManifest(...args),
}))

vi.mock('../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('Manifest command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureInitialized.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./manifest.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./manifest.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should display manifest info successfully', async () => {
    const { default: Command } = await import('./manifest.js')
    mockDaemonGetManifest.mockResolvedValue({
      schemaVersion: '1.0',
      centyVersion: '0.5.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Centy Manifest'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Schema Version: 1.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Centy Version: 0.5.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Created:'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Updated:'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./manifest.js')
    mockDaemonGetManifest.mockResolvedValue({
      schemaVersion: '1.0',
      centyVersion: '0.5.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"schemaVersion": "1.0"'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./manifest.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should rethrow non-NotInitializedError errors', async () => {
    const { default: Command } = await import('./manifest.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(error).toHaveProperty('message', 'Unknown error')
  })
})
