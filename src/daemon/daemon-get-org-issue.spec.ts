import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonGetOrgIssue } from './daemon-get-org-issue.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('daemonGetOrgIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { id: '123', title: 'Test Issue' }
    const mockClient = {
      getOrgIssue: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    const result = await daemonGetOrgIssue({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getOrgIssue).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getOrgIssue: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    await expect(daemonGetOrgIssue({} as never)).rejects.toThrow('gRPC error')
  })
})
