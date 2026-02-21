import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonGetItem = vi.fn()

vi.mock('../../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

describe('resolveItemId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return UUID unchanged when not a display number', async () => {
    const { resolveItemId } = await import('./resolve-item-id.js')
    const throwError = (_msg: string): never => {
      throw new Error(_msg)
    }
    const result = await resolveItemId(
      'some-uuid',
      'issues',
      '/project',
      throwError
    )
    expect(result).toBe('some-uuid')
    expect(mockDaemonGetItem).not.toHaveBeenCalled()
  })

  it('should resolve display number to UUID', async () => {
    const { resolveItemId } = await import('./resolve-item-id.js')
    mockDaemonGetItem.mockResolvedValue({
      success: true,
      item: { id: 'resolved-uuid', metadata: { displayNumber: 1 } },
    })
    const throwError = (_msg: string): never => {
      throw new Error(_msg)
    }
    const result = await resolveItemId('1', 'issues', '/project', throwError)
    expect(result).toBe('resolved-uuid')
    expect(mockDaemonGetItem).toHaveBeenCalledWith({
      projectPath: '/project',
      itemType: 'issues',
      itemId: '',
      displayNumber: 1,
    })
  })

  it('should call throwError when item not found', async () => {
    const { resolveItemId } = await import('./resolve-item-id.js')
    mockDaemonGetItem.mockResolvedValue({ success: false, error: 'not found' })
    const throwError = (_msg: string): never => {
      throw new Error(_msg)
    }
    await expect(
      resolveItemId('99', 'issues', '/project', throwError)
    ).rejects.toThrow('Item not found: 99')
  })
})
