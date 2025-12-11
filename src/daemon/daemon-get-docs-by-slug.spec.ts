import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the load-proto module before importing the function
vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { daemonGetDocsBySlug } from './daemon-get-docs-by-slug.js'
import { getDaemonClient } from './load-proto.js'

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
        callback: (error: Error | null, response: typeof mockResponse) => void
      ) => {
        callback(null, mockResponse)
      }
    )

    vi.mocked(getDaemonClient).mockReturnValue({
      getDocsBySlug: mockGetDocsBySlug,
    } as ReturnType<typeof getDaemonClient>)

    const result = await daemonGetDocsBySlug({ slug: 'test-slug' })
    expect(result).toEqual(mockResponse)
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('Test error')

    const mockGetDocsBySlug = vi.fn(
      (
        _request: unknown,
        callback: (error: Error | null, response: unknown) => void
      ) => {
        callback(mockError, null)
      }
    )

    vi.mocked(getDaemonClient).mockReturnValue({
      getDocsBySlug: mockGetDocsBySlug,
    } as ReturnType<typeof getDaemonClient>)

    await expect(daemonGetDocsBySlug({ slug: 'test-slug' })).rejects.toThrow(
      'Test error'
    )
  })
})
