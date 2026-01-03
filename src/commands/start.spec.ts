import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockCheckDaemonConnection = vi.fn()
const mockFindDaemonBinary = vi.fn()
const mockDaemonBinaryExists = vi.fn()
const mockWaitForDaemon = vi.fn()
const mockSpawn = vi.fn()
const mockExecSync = vi.fn()

vi.mock('../daemon/check-daemon-connection.js', () => ({
  checkDaemonConnection: () => mockCheckDaemonConnection(),
}))

vi.mock('../lib/start/find-daemon-binary.js', () => ({
  findDaemonBinary: () => mockFindDaemonBinary(),
}))

vi.mock('../lib/start/daemon-binary-exists.js', () => ({
  daemonBinaryExists: (path: string) => mockDaemonBinaryExists(path),
}))

vi.mock('../lib/start/wait-for-daemon.js', () => ({
  waitForDaemon: () => mockWaitForDaemon(),
}))

vi.mock('../lib/start/prompt-for-install.js', () => ({
  promptForInstall: vi.fn().mockResolvedValue(false),
}))

vi.mock('../utils/create-prompt-interface.js', () => ({
  createPromptInterface: vi.fn(),
}))

vi.mock('../utils/close-prompt-interface.js', () => ({
  closePromptInterface: vi.fn(),
}))

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args),
  execSync: (...args: unknown[]) => mockExecSync(...args),
}))

describe('Start command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindDaemonBinary.mockReturnValue('/usr/local/bin/centyd')
    mockDaemonBinaryExists.mockReturnValue(true)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./start.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./start.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should show already running message when daemon is connected', async () => {
    const { default: Command } = await import('./start.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: true })

    const cmd = createMockCommand(Command, {
      flags: { foreground: false, yes: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('already running'))).toBe(true)
  })

  it('should start daemon in background', async () => {
    const { default: Command } = await import('./start.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })
    mockWaitForDaemon.mockResolvedValue(true)

    const mockChild = {
      on: vi.fn(),
      unref: vi.fn(),
    }
    mockSpawn.mockReturnValue(mockChild)

    const cmd = createMockCommand(Command, {
      flags: { foreground: false, yes: false },
      args: {},
    })

    await cmd.run()

    expect(mockSpawn).toHaveBeenCalledWith(
      '/usr/local/bin/centyd',
      [],
      expect.objectContaining({ detached: true, stdio: 'ignore' })
    )
    expect(cmd.logs.some(log => log.includes('started successfully'))).toBe(
      true
    )
  })

  it('should error when daemon not responding after start', async () => {
    const { default: Command } = await import('./start.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })
    mockWaitForDaemon.mockResolvedValue(false)

    const mockChild = {
      on: vi.fn(),
      unref: vi.fn(),
    }
    mockSpawn.mockReturnValue(mockChild)

    const cmd = createMockCommand(Command, {
      flags: { foreground: false, yes: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('not responding'))).toBe(true)
  })

  it('should error when daemon binary not found', async () => {
    const { default: Command } = await import('./start.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })
    mockDaemonBinaryExists.mockReturnValue(false)

    const cmd = createMockCommand(Command, {
      flags: { foreground: false, yes: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Daemon not found'))).toBe(true)
  })

  it('should auto-install daemon with --yes flag', async () => {
    const { default: Command } = await import('./start.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })
    // First call: not exists, second call: exists after install
    mockDaemonBinaryExists.mockReturnValueOnce(false).mockReturnValueOnce(true)
    mockWaitForDaemon.mockResolvedValue(true)

    const mockChild = {
      on: vi.fn(),
      unref: vi.fn(),
    }
    mockSpawn.mockReturnValue(mockChild)

    const cmd = createMockCommand(Command, {
      flags: { foreground: false, yes: true },
      args: {},
    })

    await cmd.run()

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('curl -fsSL'),
      expect.objectContaining({
        env: expect.objectContaining({ BINARIES: 'centy-daemon' }),
      })
    )
    expect(cmd.logs.some(log => log.includes('Installing daemon'))).toBe(true)
  })

  it('should handle install failure', async () => {
    const { default: Command } = await import('./start.js')
    mockCheckDaemonConnection.mockResolvedValue({ connected: false })
    mockDaemonBinaryExists.mockReturnValue(false)
    mockExecSync.mockImplementation(() => {
      throw new Error('Network error')
    })

    const cmd = createMockCommand(Command, {
      flags: { foreground: false, yes: true },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('Failed to install'))).toBe(true)
  })
})
