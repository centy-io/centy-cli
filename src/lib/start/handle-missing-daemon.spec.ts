import { describe, it, expect } from 'vitest'
import { handleMissingDaemon } from './handle-missing-daemon.js'

describe('handleMissingDaemon', () => {
  it('should be a function', () => {
    expect(typeof handleMissingDaemon).toBe('function')
  })
})
