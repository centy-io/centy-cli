import { describe, it, expect } from 'vitest'
import { DaemonNotConnectedError } from './daemon-not-connected-error.js'

describe('DaemonNotConnectedError', () => {
  it('should create an error with the correct name', () => {
    const error = new DaemonNotConnectedError()
    expect(error.name).toBe('DaemonNotConnectedError')
    expect(error.message).toBe('Daemon not connected')
  })

  it('should be an instance of Error', () => {
    const error = new DaemonNotConnectedError()
    expect(error).toBeInstanceOf(Error)
  })
})
