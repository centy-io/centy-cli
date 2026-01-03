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
      moveIssue: vi.fn(),
    })),
    callWithDeadline: mockCallWithDeadline,
    LONG_GRPC_TIMEOUT_MS: 120000,
  }
})

describe('daemonMoveIssue', () => {
  it('should export the function', async () => {
    const { daemonMoveIssue } = await import('./daemon-move-issue.js')
    expect(typeof daemonMoveIssue).toBe('function')
  })
})
