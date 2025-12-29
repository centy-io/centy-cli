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
      moveDoc: vi.fn(),
    })),
    callWithDeadline: mockCallWithDeadline,
    LONG_GRPC_TIMEOUT_MS: 120000,
  }
})

describe('daemonMoveDoc', () => {
  it('should export the function', async () => {
    const { daemonMoveDoc } = await import('./daemon-move-doc.js')
    expect(typeof daemonMoveDoc).toBe('function')
  })
})
