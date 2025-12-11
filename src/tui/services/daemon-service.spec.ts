import { describe, expect, it } from 'vitest'

describe('DaemonService', () => {
  it('should export the service class', async () => {
    const module = await import('./daemon-service.js')
    expect(module.DaemonService).toBeDefined()
  })

  it('should export a service instance', async () => {
    const module = await import('./daemon-service.js')
    expect(module.daemonService).toBeDefined()
  })
})
