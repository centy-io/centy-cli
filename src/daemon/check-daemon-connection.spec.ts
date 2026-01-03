/* eslint-disable no-restricted-syntax */
/* eslint-disable no-optional-chaining/no-optional-chaining */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Skip these tests in bun - they require vi.runAllTimersAsync and vi.advanceTimersByTimeAsync
// and bun doesn't support vi.mock hoisting properly
const isBun = typeof Bun !== 'undefined'

// Set up mock at module level (vi.mock is hoisted)
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
    DEFAULT_GRPC_TIMEOUT_MS: 30000,
    isDeadlineExceededError: (error: { message?: string }) =>
      error?.message?.includes('DEADLINE_EXCEEDED'),
    isDaemonUnavailableError: (error: { message?: string }) =>
      error?.message?.includes('UNAVAILABLE'),
  }
})

// Only set up imports when not running in bun
let checkDaemonConnection: any
let getDaemonClient: any

if (!isBun) {
  // Dynamic imports after mock setup
  const loadProtoModule = await import('./load-proto.js')
  getDaemonClient = loadProtoModule.getDaemonClient

  const checkModule = await import('./check-daemon-connection.js')
  checkDaemonConnection = checkModule.checkDaemonConnection
}

describe.skipIf(isBun)('checkDaemonConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('should return connected true when daemon responds', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn(
        (
          _req: unknown,
          _options: unknown,
          callback: (err: null, res: { version: string }) => void
        ) => {
          callback(null, { version: '1.0.0' })
        }
      ),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should return connected false when daemon is unavailable', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn(
        (
          _req: unknown,
          _options: unknown,
          callback: (err: { message: string }, res: null) => void
        ) => {
          callback({ message: 'UNAVAILABLE: connection refused' }, null)
        }
      ),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('daemon is not running')
  })

  it('should return connected false on connection timeout', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn(
        (
          _req: unknown,
          _options: unknown,
          callback: (err: { message: string }, res: null) => void
        ) => {
          // Simulate DEADLINE_EXCEEDED error
          callback({ message: 'DEADLINE_EXCEEDED: timeout' }, null)
        }
      ),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('timeout')
  })

  it('should return connected false on generic error', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn(
        (
          _req: unknown,
          _options: unknown,
          callback: (err: { message: string }, res: null) => void
        ) => {
          callback({ message: 'Some other error' }, null)
        }
      ),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('Daemon connection error')
  })
})
