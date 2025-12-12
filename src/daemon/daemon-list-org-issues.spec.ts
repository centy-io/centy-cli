import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonListOrgIssues } from './daemon-list-org-issues.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonListOrgIssues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { issues: [], totalCount: 0 }
    const mockClient = {
      listOrgIssues: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonListOrgIssues({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.listOrgIssues).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      listOrgIssues: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonListOrgIssues({} as never)).rejects.toThrow('gRPC error')
  })
})
