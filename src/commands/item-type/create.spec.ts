import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonCreateItemType = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../../daemon/daemon-create-item-type.js', () => ({
  daemonCreateItemType: (...args: unknown[]) =>
    mockDaemonCreateItemType(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

describe('ItemTypeCreate command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./create.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./create.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should create item type with required flags', async () => {
    const { default: Command } = await import('./create.js')
    mockDaemonCreateItemType.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: {
        name: 'Bug',
        plural: 'bugs',
        identifier: 'uuid',
        statuses: 'open,closed',
        'default-status': 'open',
        'priority-levels': 3,
      },
    })

    await cmd.run()

    expect(mockDaemonCreateItemType).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        name: 'Bug',
        plural: 'bugs',
        identifier: 'uuid',
        statuses: ['open', 'closed'],
        defaultStatus: 'open',
        priorityLevels: 3,
      })
    )
  })

  it('should error if default status not in statuses', async () => {
    const { default: Command } = await import('./create.js')

    const cmd = createMockCommand(Command, {
      flags: {
        name: 'Bug',
        plural: 'bugs',
        identifier: 'uuid',
        statuses: 'open,closed',
        'default-status': 'draft',
        'priority-levels': 0,
      },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('Default status "draft"')
  })

  it('should handle daemon error response', async () => {
    const { default: Command } = await import('./create.js')
    mockDaemonCreateItemType.mockResolvedValue({
      success: false,
      error: 'Item type already exists',
    })

    const cmd = createMockCommand(Command, {
      flags: {
        name: 'Bug',
        plural: 'bugs',
        identifier: 'uuid',
        statuses: 'open,closed',
        'default-status': 'open',
        'priority-levels': 0,
      },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Item type already exists')
  })
})
