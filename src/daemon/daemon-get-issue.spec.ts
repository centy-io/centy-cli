import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetIssue } from './daemon-get-issue.js'
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

describe('daemonGetIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockIssue = { id: 'issue-1', title: 'Test Issue' }
    const mockResponse = { success: true, item: mockIssue }
    const mockClient = {
      getItem: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    const result = await daemonGetIssue({})

    expect(result).toEqual(mockIssue)
    expect(mockClient.getItem).toHaveBeenCalledWith(
      { itemType: 'issues' },
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getItem: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    await expect(daemonGetIssue({})).rejects.toThrow('gRPC error')
  })
})
