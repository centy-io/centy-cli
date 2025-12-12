import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetOrgIssueByDisplayNumber } from './daemon-get-org-issue-by-display-number.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetOrgIssueByDisplayNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { id: '123', displayNumber: 1 }
    const mockClient = {
      getOrgIssueByDisplayNumber: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetOrgIssueByDisplayNumber({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getOrgIssueByDisplayNumber).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getOrgIssueByDisplayNumber: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetOrgIssueByDisplayNumber({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
