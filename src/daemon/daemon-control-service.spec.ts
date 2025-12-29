/* eslint-disable no-restricted-syntax */
import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { DaemonControlService } from './daemon-control-service.js'

vi.mock('./daemon-shutdown.js', () => ({
  daemonShutdown: vi.fn(),
}))

vi.mock('./daemon-restart.js', () => ({
  daemonRestart: vi.fn(),
}))

// eslint-disable-next-line import/first
import { daemonShutdown } from './daemon-shutdown.js'
// eslint-disable-next-line import/first
import { daemonRestart } from './daemon-restart.js'

describe('DaemonControlService', () => {
  let service: DaemonControlService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new DaemonControlService()
  })

  describe('shutdown', () => {
    it('should return success when shutdown succeeds', async () => {
      const mockResponse = { success: true, message: 'Shutdown complete' }
      ;(daemonShutdown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      )

      const result = await service.shutdown()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should treat CANCELLED error as success', async () => {
      ;(daemonShutdown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('CANCELLED')
      )

      const result = await service.shutdown()

      expect(result.success).toBe(true)
      // eslint-disable-next-line no-optional-chaining/no-optional-chaining
      expect(result.data?.message).toContain('shutdown initiated')
    })

    it('should return error when daemon is not running', async () => {
      ;(daemonShutdown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('UNAVAILABLE')
      )

      const result = await service.shutdown()

      expect(result.success).toBe(false)
      expect(result.error).toContain('not running')
    })

    it('should return error on other failures', async () => {
      ;(daemonShutdown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Unknown error')
      )

      const result = await service.shutdown()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })
  })

  describe('restart', () => {
    it('should return success when restart succeeds', async () => {
      const mockResponse = { success: true, message: 'Restart complete' }
      ;(daemonRestart as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      )

      const result = await service.restart()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should treat CANCELLED error as success', async () => {
      ;(daemonRestart as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('CANCELLED')
      )

      const result = await service.restart()

      expect(result.success).toBe(true)
      // eslint-disable-next-line no-optional-chaining/no-optional-chaining
      expect(result.data?.message).toContain('restart initiated')
    })

    it('should return error when daemon is not running', async () => {
      ;(daemonRestart as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('ECONNREFUSED')
      )

      const result = await service.restart()

      expect(result.success).toBe(false)
      expect(result.error).toContain('not running')
    })
  })
})
