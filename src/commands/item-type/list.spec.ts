import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListItemTypes = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../../daemon/daemon-list-item-types.js', () => ({
  daemonListItemTypes: (...args: unknown[]) => mockDaemonListItemTypes(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../../utils/ensure-initialized.js', () => ({
  ensureInitialized: vi.fn().mockResolvedValue(undefined),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('ItemTypeList command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./list.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list item types successfully', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListItemTypes.mockResolvedValue({
      success: true,
      itemTypes: [
        {
          name: 'Bug',
          plural: 'bugs',
          identifier: 'uuid',
          features: [],
          statuses: ['open', 'closed'],
          defaultStatus: 'open',
          priorityLevels: 3,
        },
      ],
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockDaemonListItemTypes).toHaveBeenCalledWith(
      expect.objectContaining({ projectPath: '/test/project' })
    )
    expect(cmd.logs.some(l => l.includes('1 item type'))).toBe(true)
  })

  it('should show message when no item types found', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListItemTypes.mockResolvedValue({
      success: true,
      itemTypes: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toContain('No item types found')
  })

  it('should output JSON when --json flag is passed', async () => {
    const { default: Command } = await import('./list.js')
    const itemTypes = [
      {
        name: 'Bug',
        plural: 'bugs',
        identifier: 'uuid',
        features: [],
        statuses: ['open'],
        defaultStatus: 'open',
        priorityLevels: 0,
      },
    ]
    mockDaemonListItemTypes.mockResolvedValue({
      success: true,
      itemTypes,
      totalCount: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs[0]).toContain('"name": "Bug"')
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./list.js')
    mockDaemonListItemTypes.mockResolvedValue({
      success: false,
      error: 'Failed to list item types',
      itemTypes: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Failed to list item types')
  })
})
