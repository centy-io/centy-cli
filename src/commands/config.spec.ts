import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetConfig = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../daemon/daemon-get-config.js', () => ({
  daemonGetConfig: (...args: unknown[]) => mockDaemonGetConfig(...args),
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

describe('Config command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./config.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./config.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should display config', async () => {
    const { default: Command } = await import('./config.js')
    mockDaemonGetConfig.mockResolvedValue({
      defaults: {
        priorityLevels: 3,
        defaultState: 'open',
      },
      customFields: [],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(mockEnsureInitialized).toHaveBeenCalled()
    expect(mockDaemonGetConfig).toHaveBeenCalled()
    expect(cmd.logs.length).toBeGreaterThan(0)
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./config.js')
    const config = {
      defaults: {
        priorityLevels: 3,
        defaultState: 'open',
      },
      customFields: [],
    }
    mockDaemonGetConfig.mockResolvedValue(config)

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(config, null, 2))
  })

  it('should display custom fields', async () => {
    const { default: Command } = await import('./config.js')
    mockDaemonGetConfig.mockResolvedValue({
      defaults: {
        priorityLevels: 3,
      },
      customFields: [
        {
          name: 'epic',
          fieldType: 'string',
          required: true,
          defaultValue: null,
          enumValues: [],
        },
        {
          name: 'component',
          fieldType: 'enum',
          required: false,
          defaultValue: 'frontend',
          enumValues: ['frontend', 'backend', 'api'],
        },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(cmd.logs.join('\n')).toContain('Custom Fields')
    expect(cmd.logs.join('\n')).toContain('epic')
    expect(cmd.logs.join('\n')).toContain('component')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./config.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })
})
