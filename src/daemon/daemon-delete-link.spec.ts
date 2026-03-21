import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonDeleteLink } from './daemon-delete-link.js'
import { getDaemonClient } from './load-proto.js'

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

describe('daemonDeleteLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true, deletedCount: 2 }
    const mockClient = {
      deleteLink: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    const result = await daemonDeleteLink({})

    expect(result).toEqual(mockResponse)
    expect(mockClient.deleteLink).toHaveBeenCalledWith(
      {},
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      deleteLink: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    await expect(daemonDeleteLink({})).rejects.toThrow('gRPC error')
  })
})
