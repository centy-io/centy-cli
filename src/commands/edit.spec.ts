import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../testing/command-test-utils.js'

const mockDaemonUpdateItem = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockResolveItemId = vi.fn()

vi.mock('../daemon/daemon-update-item.js', () => ({
  daemonUpdateItem: (...args: unknown[]) => mockDaemonUpdateItem(...args),
}))

vi.mock('../lib/resolve-item-id/resolve-item-id.js', () => ({
  resolveItemId: (...args: unknown[]) => mockResolveItemId(...args),
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
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

describe('Edit command (alias for update)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
    mockResolveItemId.mockResolvedValue('item-uuid')
  })

  it('should update item status', async () => {
    const { default: Command } = await import('./edit.js')
    mockDaemonUpdateItem.mockResolvedValue({
      success: true,
      item: { id: 'item-uuid', metadata: { displayNumber: 1 } },
    })

    const cmd = createMockCommand(Command, {
      flags: { status: 'closed' },
      args: { type: 'issue', id: 'item-uuid' },
    })

    await cmd.run()

    expect(mockDaemonUpdateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        itemType: 'issues',
        itemId: 'item-uuid',
        status: 'closed',
      })
    )
    expect(cmd.logs[0]).toContain('Updated issue')
  })

  it('should be an alias with the same args and flags as update', async () => {
    const { default: Edit } = await import('./edit.js')
    const { default: Update } = await import('./update.js')

    expect(Edit.args).toEqual(Update.args)
    expect(Object.keys(Edit.flags)).toEqual(Object.keys(Update.flags))
  })
})
