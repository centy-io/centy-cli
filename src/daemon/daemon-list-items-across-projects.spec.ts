import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonListItemsAcrossProjects } from './daemon-list-items-across-projects.js'
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

describe('daemonListItemsAcrossProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = {
      success: true,
      items: [],
      totalCount: 0,
      errors: [],
      error: '',
    }
    const mockClient = {
      listItemsAcrossProjects: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    const result = await daemonListItemsAcrossProjects({
      itemType: 'issues',
      filter: '',
      limit: 0,
      offset: 0,
    })

    expect(result).toEqual(mockResponse)
    expect(mockClient.listItemsAcrossProjects).toHaveBeenCalled()
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      listItemsAcrossProjects: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    await expect(
      daemonListItemsAcrossProjects({
        itemType: 'issues',
        filter: '',
        limit: 0,
        offset: 0,
      })
    ).rejects.toThrow('gRPC error')
  })
})
