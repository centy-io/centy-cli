import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockCheckDaemonConnection = vi.fn()
const mockDaemonGetDaemonInfo = vi.fn()

vi.mock('../../daemon/check-daemon-connection.js', () => ({
  checkDaemonConnection: () => mockCheckDaemonConnection(),
}))

vi.mock('../../daemon/daemon-get-daemon-info.js', () => ({
  daemonGetDaemonInfo: (...args: unknown[]) => mockDaemonGetDaemonInfo(...args),
}))

describe('DaemonStatus command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line no-restricted-syntax
    delete process.env['CENTY_DAEMON_ADDR']
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./status.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./status.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should report daemon as stopped when not connected', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({
      connected: false,
      error: 'Centy daemon is not running. Please start the daemon first.',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('stopped'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('not running'))).toBe(true)
  })

  it('should report daemon as stopped in JSON when not connected', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({
      connected: false,
      error: 'Connection timeout',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"status": "stopped"'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Connection timeout'))).toBe(true)
  })

  it('should report daemon as running with info', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '1.0.0',
      binaryPath: '/usr/local/bin/centyd',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('running'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('1.0.0'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('127.0.0.1:50051'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('/usr/local/bin/centyd'))).toBe(
      true
    )
  })

  it('should use custom address from env var', async () => {
    // eslint-disable-next-line no-restricted-syntax
    process.env['CENTY_DAEMON_ADDR'] = 'localhost:9090'
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockDaemonGetDaemonInfo.mockResolvedValue({ version: '1.0.0' })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('localhost:9090'))).toBe(true)
  })

  it('should output JSON when json flag is set and daemon is running', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockDaemonGetDaemonInfo.mockResolvedValue({
      version: '1.0.0',
      binaryPath: '/usr/local/bin/centyd',
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"status": "running"'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('"version": "1.0.0"'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('"address"'))).toBe(true)
  })

  it('should handle info fetch failure gracefully when connected', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('RPC failed'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('running'))).toBe(true)
  })

  it('should handle info fetch failure in JSON mode', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('RPC failed'))

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('"status": "running"'))).toBe(true)
  })

  it('should not show binary path when not available', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })
    mockDaemonGetDaemonInfo.mockResolvedValue({ version: '1.0.0' })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Binary'))).toBe(false)
  })

  it('should report stopped without error detail when no error message', async () => {
    const { default: Command } = await import('./status.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('stopped'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Reason'))).toBe(false)
  })
})
