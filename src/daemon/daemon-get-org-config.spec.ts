import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetOrgConfig } from './daemon-get-org-config.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetOrgConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { config: {} }
    const mockClient = {
      getOrgConfig: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetOrgConfig({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getOrgConfig).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getOrgConfig: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetOrgConfig({} as never)).rejects.toThrow('gRPC error')
  })
})
