import { describe, expect, it, vi } from 'vitest'

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
    getDaemonClient: vi.fn(() => ({
      duplicateDoc: vi.fn(),
    })),
    callWithDeadline: mockCallWithDeadline,
    LONG_GRPC_TIMEOUT_MS: 120000,
  }
})

describe('daemonDuplicateDoc', () => {
  it('should export the function', async () => {
    const { daemonDuplicateDoc } = await import('./daemon-duplicate-doc.js')
    expect(typeof daemonDuplicateDoc).toBe('function')
  })
})
