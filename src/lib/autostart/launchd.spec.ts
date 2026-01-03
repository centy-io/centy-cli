import { describe, expect, it } from 'vitest'
import { launchdService } from './launchd.js'

describe('launchdService', () => {
  describe('getAutostartStatus', () => {
    it('should return an object with enabled property', () => {
      const status = launchdService.getAutostartStatus()
      expect(status).toHaveProperty('enabled')
      expect(typeof status.enabled).toBe('boolean')
    })

    it('should optionally include daemonPath when enabled', () => {
      const status = launchdService.getAutostartStatus()
      if (status.enabled) {
        expect(status.daemonPath).toBeDefined()
      }
    })
  })
})
