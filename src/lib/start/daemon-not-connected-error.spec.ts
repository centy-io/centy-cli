import { describe, expect, it } from 'vitest'
import { DaemonNotConnectedError } from './daemon-not-connected-error.js'

describe('DaemonNotConnectedError', () => {
  it('should be an instance of Error', () => {
    const error = new DaemonNotConnectedError()
    expect(error).toBeInstanceOf(Error)
  })

  it('should have the correct message', () => {
    const error = new DaemonNotConnectedError()
    expect(error.message).toBe('Daemon not connected')
  })

  it('should have the correct name', () => {
    const error = new DaemonNotConnectedError()
    expect(error.name).toBe('DaemonNotConnectedError')
  })
})
