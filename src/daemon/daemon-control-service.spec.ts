
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DaemonControlService } from './daemon-control-service.js'
import { daemonShutdown } from './daemon-shutdown.js'
import { daemonRestart } from './daemon-restart.js'

vi.mock('./daemon-shutdown.js', () => ({
  daemonShutdown: vi.fn(),
}))

vi.mock('./daemon-restart.js', () => ({
  daemonRestart: vi.fn(),
}))


describe('DaemonControlService', () => {
  let service: DaemonControlService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new DaemonControlService()
  })

  describe('shutdown', () => {
    it('should return success when shutdown succeeds', async () => {
      const mockResponse = { success: true, message: 'Shutdown complete' }
      ;vi.mocked(daemonShutdown).mockResolvedValue(
        mockResponse
      )

      const result = await service.shutdown()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should treat CANCELLED error as success', async () => {
      ;vi.mocked(daemonShutdown).mockRejectedValue(
        new Error('CANCELLED')
      )

      const result = await service.shutdown()

      expect(result.success).toBe(true)
      expect(result.data!.message).toContain('shutdown initiated')
    })

    it('should return error when daemon is not running', async () => {
      ;vi.mocked(daemonShutdown).mockRejectedValue(
        new Error('UNAVAILABLE')
      )

      const result = await service.shutdown()

      expect(result.success).toBe(false)
      expect(result.error).toContain('not running')
    })

    it('should return error on other failures', async () => {
      ;vi.mocked(daemonShutdown).mockRejectedValue(
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
      ;vi.mocked(daemonRestart).mockResolvedValue(
        mockResponse
      )

      const result = await service.restart()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should treat CANCELLED error as success', async () => {
      ;vi.mocked(daemonRestart).mockRejectedValue(
        new Error('CANCELLED')
      )

      const result = await service.restart()

      expect(result.success).toBe(true)
      expect(result.data!.message).toContain('restart initiated')
    })

    it('should return error when daemon is not running', async () => {
      ;vi.mocked(daemonRestart).mockRejectedValue(
        new Error('ECONNREFUSED')
      )

      const result = await service.restart()

      expect(result.success).toBe(false)
      expect(result.error).toContain('not running')
    })
  })
})
