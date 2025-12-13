import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNotify = vi.fn()
const mockUpdateNotifier = vi.fn(() => ({
  notify: mockNotify,
}))

vi.mock('update-notifier', () => ({
  default: (options: unknown) => mockUpdateNotifier(options),
}))

const { default: hook } = await import('./postrun.js')

describe('postrun hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call updateNotifier with correct package config', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({} as never, {} as never)

    expect(mockUpdateNotifier).toHaveBeenCalledWith(
      expect.objectContaining({
        pkg: expect.objectContaining({
          name: 'centy',
        }),
        updateCheckInterval: 1000 * 60 * 60 * 24,
      })
    )
  })

  it('should call notify with isGlobal true', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({} as never, {} as never)

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        isGlobal: true,
      })
    )
  })

  it('should include update message in notification', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({} as never, {} as never)

    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Update available'),
      })
    )
  })
})
