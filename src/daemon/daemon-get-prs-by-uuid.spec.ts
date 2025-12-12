// eslint-disable-next-line import/order
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the load-proto module before importing the function
vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

// eslint-disable-next-line import/first
import { daemonGetPrsByUuid } from './daemon-get-prs-by-uuid.js'
// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('daemonGetPrsByUuid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = {
      prs: [],
      totalCount: 0,
      errors: [],
    }

    const mockGetPrsByUuid = vi.fn(
      (
        _request: unknown,
        callback: (error: Error | null, response: typeof mockResponse) => void
      ) => {
        callback(null, mockResponse)
      }
    )

    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue({
      getPrsByUuid: mockGetPrsByUuid,
    } as ReturnType<typeof getDaemonClient>)

    const result = await daemonGetPrsByUuid({ uuid: 'test-uuid' })
    expect(result).toEqual(mockResponse)
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('Test error')

    const mockGetPrsByUuid = vi.fn(
      (
        _request: unknown,
        callback: (error: Error | null, response: unknown) => void
      ) => {
        callback(mockError, null)
      }
    )

    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue({
      getPrsByUuid: mockGetPrsByUuid,
    } as ReturnType<typeof getDaemonClient>)

    await expect(daemonGetPrsByUuid({ uuid: 'test-uuid' })).rejects.toThrow(
      'Test error'
    )
  })
})
