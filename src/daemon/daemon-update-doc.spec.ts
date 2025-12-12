import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonUpdateDoc } from './daemon-update-doc.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('daemonUpdateDoc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      updateDoc: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    const result = await daemonUpdateDoc({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.updateDoc).toHaveBeenCalledWith({}, expect.any(Function))
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      updateDoc: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    await expect(daemonUpdateDoc({} as never)).rejects.toThrow('gRPC error')
  })
})
