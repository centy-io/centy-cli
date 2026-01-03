import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonControlService = {
  restart: vi.fn(),
}

vi.mock('../daemon/daemon-control-service.js', () => ({
  daemonControlService: mockDaemonControlService,
}))

describe('Restart command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./restart.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./restart.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should restart daemon successfully with message from result', async () => {
    const { default: Command } = await import('./restart.js')
    mockDaemonControlService.restart.mockResolvedValue({
      success: true,
      data: { message: 'Daemon will restart in 0 seconds' },
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    await cmd.run()

    expect(mockDaemonControlService.restart).toHaveBeenCalledWith({
      delaySeconds: 0,
    })
    expect(cmd.logs).toContain('Daemon will restart in 0 seconds')
  })

  it('should restart daemon with delay flag', async () => {
    const { default: Command } = await import('./restart.js')
    mockDaemonControlService.restart.mockResolvedValue({
      success: true,
      data: { message: 'Daemon will restart in 5 seconds' },
    })

    const cmd = createMockCommand(Command, { flags: { delay: 5 } })
    await cmd.run()

    expect(mockDaemonControlService.restart).toHaveBeenCalledWith({
      delaySeconds: 5,
    })
    expect(cmd.logs).toContain('Daemon will restart in 5 seconds')
  })

  it('should use default message when no data returned', async () => {
    const { default: Command } = await import('./restart.js')
    mockDaemonControlService.restart.mockResolvedValue({
      success: true,
      data: null,
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    await cmd.run()

    expect(cmd.logs).toContain('Daemon restart initiated')
  })

  it('should handle restart failure with error message', async () => {
    const { default: Command } = await import('./restart.js')
    mockDaemonControlService.restart.mockResolvedValue({
      success: false,
      error: 'Connection lost',
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Connection lost')
  })

  it('should handle restart failure with default error message', async () => {
    const { default: Command } = await import('./restart.js')
    mockDaemonControlService.restart.mockResolvedValue({
      success: false,
      error: null,
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Restart failed')
  })
})
