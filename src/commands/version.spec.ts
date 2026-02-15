import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetDaemonInfo = vi.fn()
const mockGetVersion = vi.fn()

vi.mock('../daemon/daemon-get-daemon-info.js', () => ({
  daemonGetDaemonInfo: (...args: unknown[]) => mockDaemonGetDaemonInfo(...args),
}))

vi.mock('../get-version.js', () => ({
  getVersion: () => mockGetVersion(),
}))

describe('Version command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetVersion.mockReturnValue('0.4.0')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./version.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./version.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should display CLI and daemon versions when daemon is running', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '0.4.0',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(mockGetVersion).toHaveBeenCalled()
    expect(mockDaemonGetDaemonInfo).toHaveBeenCalledWith({})
    expect(cmd.logs.some(log => log.includes('CLI: 0.4.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Daemon: 0.4.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Status: Up to date'))).toBe(true)
  })

  it('should show version mismatch when versions differ', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '0.3.0',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('CLI: 0.4.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Daemon: 0.3.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Status: Version mismatch'))).toBe(
      true
    )
  })

  it('should handle daemon not running', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('UNAVAILABLE'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('CLI: 0.4.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Daemon: not running'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Status: Not running'))).toBe(true)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '0.4.0',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    const jsonOutput = cmd.logs.join('\n')
    const parsed = JSON.parse(jsonOutput)
    expect(parsed).toEqual({
      cli: '0.4.0',
      daemon: '0.4.0',
      status: 'Up to date',
    })
  })

  it('should output JSON with null daemon when not running', async () => {
    const { default: Command } = await import('./version.js')
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('ECONNREFUSED'))

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    const jsonOutput = cmd.logs.join('\n')
    const parsed = JSON.parse(jsonOutput)
    expect(parsed).toEqual({
      cli: '0.4.0',
      daemon: null,
      status: 'Not running',
    })
  })
})
