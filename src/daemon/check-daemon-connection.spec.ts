import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { checkDaemonConnection as CheckDaemonConnectionFn } from './check-daemon-connection.js'
import type { getDaemonClient as GetDaemonClientFn } from './load-proto.js'

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
      error.message !== undefined &&
      error.message.includes('DEADLINE_EXCEEDED'),
    isDaemonUnavailableError: (error: { message?: string }) =>
      error.message !== undefined && error.message.includes('UNAVAILABLE'),
  }
})

// Only set up imports when not running in bun
let checkDaemonConnection: typeof CheckDaemonConnectionFn | undefined
let getDaemonClient: typeof GetDaemonClientFn | undefined

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

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

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
          callback: (err: Error & { code?: number }, res: null) => void
        ) => {
          callback(
            Object.assign(new Error('UNAVAILABLE: connection refused'), {
              code: 14,
            }),
            null
          )
        }
      ),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

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
          callback: (err: Error & { code?: number }, res: null) => void
        ) => {
          // Simulate DEADLINE_EXCEEDED error
          callback(
            Object.assign(new Error('DEADLINE_EXCEEDED: timeout'), { code: 4 }),
            null
          )
        }
      ),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

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
          callback: (err: Error & { code?: number }, res: null) => void
        ) => {
          callback(
            Object.assign(new Error('Some other error'), { code: 2 }),
            null
          )
        }
      ),
    }

    vi.mocked(getDaemonClient).mockReturnValue(mockClient)

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('Daemon connection error')
  })
})
