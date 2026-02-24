import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonGetItem = vi.fn()

vi.mock('../../daemon/daemon-get-item.js', () => ({
  daemonGetItem: (...args: unknown[]) => mockDaemonGetItem(...args),
}))

describe('parseDisplayNumber', () => {
  it('should return a number for a numeric string', async () => {
    const { parseDisplayNumber } = await import('./resolve-item-id.js')
    expect(parseDisplayNumber('1')).toBe(1)
    expect(parseDisplayNumber('42')).toBe(42)
    expect(parseDisplayNumber('99')).toBe(99)
  })

  it('should return undefined for a UUID string', async () => {
    const { parseDisplayNumber } = await import('./resolve-item-id.js')
    expect(parseDisplayNumber('some-uuid')).toBeUndefined()
    expect(
      parseDisplayNumber('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    ).toBeUndefined()
  })

  it('should return undefined for a slug string', async () => {
    const { parseDisplayNumber } = await import('./resolve-item-id.js')
    expect(parseDisplayNumber('getting-started')).toBeUndefined()
    expect(parseDisplayNumber('john-doe')).toBeUndefined()
  })
})

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
