import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockLaunchdService = {
  enableAutostart: vi.fn(),
  disableAutostart: vi.fn(),
  getAutostartStatus: vi.fn(),
}

const mockFindDaemonBinary = vi.fn()
const mockDaemonBinaryExists = vi.fn()

vi.mock('../../lib/autostart/launchd.js', () => ({
  launchdService: mockLaunchdService,
}))

vi.mock('../../lib/start/find-daemon-binary.js', () => ({
  findDaemonBinary: () => mockFindDaemonBinary(),
}))

vi.mock('../../lib/start/daemon-binary-exists.js', () => ({
  daemonBinaryExists: (path: string) => mockDaemonBinaryExists(path),
}))

describe('DaemonAutostart command', () => {
  const originalPlatform = process.platform

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock darwin platform for tests
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      writable: true,
    })
    mockFindDaemonBinary.mockReturnValue('/usr/local/bin/centyd')
    mockDaemonBinaryExists.mockReturnValue(true)
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
    })
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./autostart.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./autostart.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should show autostart status when no flags', async () => {
    const { default: Command } = await import('./autostart.js')
    mockLaunchdService.getAutostartStatus.mockReturnValue({
      enabled: true,
      daemonPath: '/usr/local/bin/centyd',
    })

    const cmd = createMockCommand(Command, {
      flags: { enable: false, disable: false },
      args: {},
    })

    await cmd.run()

    expect(mockLaunchdService.getAutostartStatus).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('enabled'))).toBe(true)
  })

  it('should enable autostart with --enable flag', async () => {
    const { default: Command } = await import('./autostart.js')

    const cmd = createMockCommand(Command, {
      flags: { enable: true, disable: false },
      args: {},
    })

    await cmd.run()

    expect(mockLaunchdService.enableAutostart).toHaveBeenCalledWith(
      '/usr/local/bin/centyd'
    )
    expect(cmd.logs.some(log => log.includes('enabled'))).toBe(true)
  })

  it('should disable autostart with --disable flag', async () => {
    const { default: Command } = await import('./autostart.js')

    const cmd = createMockCommand(Command, {
      flags: { enable: false, disable: true },
      args: {},
    })

    await cmd.run()

    expect(mockLaunchdService.disableAutostart).toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('disabled'))).toBe(true)
  })

  it('should show disabled status', async () => {
    const { default: Command } = await import('./autostart.js')
    mockLaunchdService.getAutostartStatus.mockReturnValue({
      enabled: false,
    })

    const cmd = createMockCommand(Command, {
      flags: { enable: false, disable: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('disabled'))).toBe(true)
  })

  it('should error on non-darwin platform', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      writable: true,
    })

    const { default: Command } = await import('./autostart.js')

    const cmd = createMockCommand(Command, {
      flags: { enable: false, disable: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('only supported on macOS'))).toBe(
      true
    )
  })

  it('should error when daemon binary not found', async () => {
    const { default: Command } = await import('./autostart.js')
    mockDaemonBinaryExists.mockReturnValue(false)

    const cmd = createMockCommand(Command, {
      flags: { enable: true, disable: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Daemon binary not found'))).toBe(
      true
    )
  })

  it('should handle enable error', async () => {
    const { default: Command } = await import('./autostart.js')
    mockLaunchdService.enableAutostart.mockImplementation(() => {
      throw new Error('Permission denied')
    })

    const cmd = createMockCommand(Command, {
      flags: { enable: true, disable: false },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Permission denied'))).toBe(true)
  })

  it('should handle disable error', async () => {
    const { default: Command } = await import('./autostart.js')
    mockLaunchdService.disableAutostart.mockImplementation(() => {
      throw new Error('File not found')
    })

    const cmd = createMockCommand(Command, {
      flags: { enable: false, disable: true },
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('File not found'))).toBe(true)
  })
})
