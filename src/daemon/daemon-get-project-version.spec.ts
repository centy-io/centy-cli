/* eslint-disable no-restricted-syntax */
import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonGetProjectVersion } from './daemon-get-project-version.js'

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
import { getDaemonClient } from './load-proto.js'

describe('daemonGetProjectVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      getProjectVersion: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const result = await daemonGetProjectVersion({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getProjectVersion).toHaveBeenCalledWith(
      {},
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getProjectVersion: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    await expect(daemonGetProjectVersion({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
