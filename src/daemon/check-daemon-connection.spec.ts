import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { checkDaemonConnection } from './check-daemon-connection.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('checkDaemonConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('should return connected true when daemon responds', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn((_req, callback) => {
        callback(null, { version: '1.0.0' })
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should return connected false when daemon is unavailable', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn((_req, callback) => {
        callback({ message: 'UNAVAILABLE: connection refused' }, null)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('daemon is not running')
  })

  it('should return connected false on connection timeout', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn(() => {
        // Never calls callback - simulates timeout
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const resultPromise = checkDaemonConnection()
    await vi.advanceTimersByTimeAsync(5000)
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('timeout')
  })

  it('should return connected false on generic error', async () => {
    const mockClient = {
      getDaemonInfo: vi.fn((_req, callback) => {
        callback({ message: 'Some other error' }, null)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const resultPromise = checkDaemonConnection()
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(result.connected).toBe(false)
    expect(result.error).toContain('Daemon connection error')
  })
})
