import { describe, expect, it } from 'vitest'

describe('ClipboardService', () => {
  it('should export the service class', async () => {
    const module = await import('./clipboard-service.js')
    expect(module.ClipboardService).toBeDefined()
  })

  it('should export a service instance', async () => {
    const module = await import('./clipboard-service.js')
    expect(module.clipboardService).toBeDefined()
  })
})
