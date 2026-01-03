import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonControlService = {
  shutdown: vi.fn(),
}

vi.mock('../daemon/daemon-control-service.js', () => ({
  daemonControlService: mockDaemonControlService,
}))

describe('Shutdown command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./shutdown.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./shutdown.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should shutdown daemon successfully with message from result', async () => {
    const { default: Command } = await import('./shutdown.js')
    mockDaemonControlService.shutdown.mockResolvedValue({
      success: true,
      data: { message: 'Daemon will shutdown in 0 seconds' },
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    await cmd.run()

    expect(mockDaemonControlService.shutdown).toHaveBeenCalledWith({
      delaySeconds: 0,
    })
    expect(cmd.logs).toContain('Daemon will shutdown in 0 seconds')
  })

  it('should shutdown daemon with delay flag', async () => {
    const { default: Command } = await import('./shutdown.js')
    mockDaemonControlService.shutdown.mockResolvedValue({
      success: true,
      data: { message: 'Daemon will shutdown in 10 seconds' },
    })

    const cmd = createMockCommand(Command, { flags: { delay: 10 } })
    await cmd.run()

    expect(mockDaemonControlService.shutdown).toHaveBeenCalledWith({
      delaySeconds: 10,
    })
    expect(cmd.logs).toContain('Daemon will shutdown in 10 seconds')
  })

  it('should use default message when no data returned', async () => {
    const { default: Command } = await import('./shutdown.js')
    mockDaemonControlService.shutdown.mockResolvedValue({
      success: true,
      data: null,
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    await cmd.run()

    expect(cmd.logs).toContain('Daemon shutdown initiated')
  })

  it('should handle shutdown failure with error message', async () => {
    const { default: Command } = await import('./shutdown.js')
    mockDaemonControlService.shutdown.mockResolvedValue({
      success: false,
      error: 'Permission denied',
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Permission denied')
  })

  it('should handle shutdown failure with default error message', async () => {
    const { default: Command } = await import('./shutdown.js')
    mockDaemonControlService.shutdown.mockResolvedValue({
      success: false,
      error: null,
    })

    const cmd = createMockCommand(Command, { flags: { delay: 0 } })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Shutdown failed')
  })
})
