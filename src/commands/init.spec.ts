import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockInit = vi.fn()

vi.mock('../lib/init/index.js', () => ({
  init: (...args: unknown[]) => mockInit(...args),
}))

describe('Init command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./init.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./init.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should initialize with default options', async () => {
    const { default: Command } = await import('./init.js')
    mockInit.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: false },
    })

    await cmd.run()

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        force: false,
      })
    )
  })

  it('should pass force flag', async () => {
    const { default: Command } = await import('./init.js')
    mockInit.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
    })

    await cmd.run()

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        force: true,
      })
    )
  })

  it('should pass config flags', async () => {
    const { default: Command } = await import('./init.js')
    mockInit.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: {
        'priority-levels': 5,
        'default-state': 'backlog',
        version: '1.0.0',
      },
    })

    await cmd.run()

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        priorityLevels: 5,
        defaultState: 'backlog',
        version: '1.0.0',
      })
    )
  })

  it('should pass LLM flags', async () => {
    const { default: Command } = await import('./init.js')
    mockInit.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: {
        'llm-auto-close': true,
        'llm-update-status': false,
        'llm-allow-direct-edits': true,
      },
    })

    await cmd.run()

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        llmAutoClose: true,
        llmUpdateStatus: false,
        llmAllowDirectEdits: true,
      })
    )
  })

  it('should parse allowed-states as comma-separated list', async () => {
    const { default: Command } = await import('./init.js')
    mockInit.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: {
        'allowed-states': 'open, in-progress, closed',
      },
    })

    await cmd.run()

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedStates: ['open', 'in-progress', 'closed'],
      })
    )
  })

  it('should exit with code 1 on failure', async () => {
    const { default: Command } = await import('./init.js')
    mockInit.mockResolvedValue({ success: false })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.exitCode).toBe(1)
  })
})
