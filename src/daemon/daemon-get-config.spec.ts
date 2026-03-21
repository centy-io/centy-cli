
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetConfig } from './daemon-get-config.js'
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


describe('daemonGetConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockConfig = { priorityLevels: 3 }
    const mockResponse = { success: true, config: mockConfig }
    const mockClient = {
      getConfig: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    ;vi.mocked(getDaemonClient).mockReturnValue(
      mockClient
    )

    const result = await daemonGetConfig({})

    expect(result).toEqual(mockConfig)
    expect(mockClient.getConfig).toHaveBeenCalledWith(
      {},
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getConfig: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    ;vi.mocked(getDaemonClient).mockReturnValue(
      mockClient
    )

    await expect(daemonGetConfig({})).rejects.toThrow('gRPC error')
  })
})
