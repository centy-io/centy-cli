import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetDaemonInfo = vi.fn()

vi.mock('../daemon/daemon-get-daemon-info.js', () => ({
  daemonGetDaemonInfo: (...args: unknown[]) => mockDaemonGetDaemonInfo(...args),
}))

describe('Info command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./info.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./info.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should display daemon info successfully', async () => {
    const { default: Command } = await import('./info.js')
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '1.0.0',
      binaryPath: '/usr/local/bin/centyd',
      availableVersions: ['1.0.0', '0.9.0'],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(mockDaemonGetDaemonInfo).toHaveBeenCalledWith({})
    expect(cmd.logs.some(log => log.includes('Centy Daemon'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('1.0.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('/usr/local/bin/centyd'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('Available versions'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./info.js')
    const mockInfo = {
      version: '1.0.0',
      binaryPath: '/usr/local/bin/centyd',
      availableVersions: [],
    }
    mockDaemonGetDaemonInfo.mockResolvedValue(mockInfo)

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"version": "1.0.0"'))).toBe(true)
  })

  it('should handle daemon not running error', async () => {
    const { default: Command } = await import('./info.js')
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('UNAVAILABLE'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('not running'))).toBe(true)
  })

  it('should handle connection refused error', async () => {
    const { default: Command } = await import('./info.js')
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('ECONNREFUSED'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('not running'))).toBe(true)
  })

  it('should handle other errors', async () => {
    const { default: Command } = await import('./info.js')
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Unknown error')
  })

  it('should display info without optional fields', async () => {
    const { default: Command } = await import('./info.js')
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '1.0.0',
      availableVersions: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('1.0.0'))).toBe(true)
  })
})
