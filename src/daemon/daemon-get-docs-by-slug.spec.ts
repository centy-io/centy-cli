
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { daemonGetDocsBySlug } from './daemon-get-docs-by-slug.js'
import { getDaemonClient } from './load-proto.js'

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


describe('daemonGetDocsBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = {
      docs: [],
      totalCount: 0,
      errors: [],
    }

    const mockGetDocsBySlug = vi.fn(
      (
        _request: unknown,
        _options: unknown,
        callback: (error: Error | null, response: typeof mockResponse) => void
      ) => {
        callback(null, mockResponse)
      }
    )

    ;vi.mocked(getDaemonClient).mockReturnValue({
      searchItems: mockGetDocsBySlug,
    })

    const result = await daemonGetDocsBySlug({ slug: 'test-slug' })
    expect(result).toEqual(mockResponse)
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('Test error')

    const mockGetDocsBySlug = vi.fn(
      (
        _request: unknown,
        _options: unknown,
        callback: (error: Error | null, response: unknown) => void
      ) => {
        callback(mockError, null)
      }
    )

    ;vi.mocked(getDaemonClient).mockReturnValue({
      searchItems: mockGetDocsBySlug,
    })

    await expect(daemonGetDocsBySlug({ slug: 'test-slug' })).rejects.toThrow(
      'Test error'
    )
  })
})
