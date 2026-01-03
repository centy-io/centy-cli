/* eslint-disable no-restricted-syntax */
// eslint-disable-next-line import/order
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the load-proto module before importing the function
vi.mock('./load-proto.js', () => {
  const mockCallWithDeadline = vi.fn(async (method, request, _timeout) => {
    return new Promise((resolve, reject) => {
      method(request, {}, (error: Error | null, response: unknown) => {
        if (error) reject(error)
        else resolve(response)
      })
    })
  })
  return {
    getDaemonClient: vi.fn(),
    callWithDeadline: mockCallWithDeadline,
    LONG_GRPC_TIMEOUT_MS: 120000,
  }
})

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
        _options: unknown,
        callback: (error: Error | null, response: typeof mockResponse) => void
      ) => {
        callback(null, mockResponse)
      }
    )

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue({
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
        _options: unknown,
        callback: (error: Error | null, response: unknown) => void
      ) => {
        callback(mockError, null)
      }
    )

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getPrsByUuid: mockGetPrsByUuid,
    } as ReturnType<typeof getDaemonClient>)

    await expect(daemonGetPrsByUuid({ uuid: 'test-uuid' })).rejects.toThrow(
      'Test error'
    )
  })
})
