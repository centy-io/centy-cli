import { describe, expect, it } from 'vitest'
import { DaemonResponseError } from './daemon-response-error.js'

describe('DaemonResponseError', () => {
  it('should set name to DaemonResponseError', () => {
    const error = new DaemonResponseError('test message')
    expect(error.name).toBe('DaemonResponseError')
  })

  it('should set the message', () => {
    const error = new DaemonResponseError('Config not found')
    expect(error.message).toBe('Config not found')
  })

  it('should be an instance of Error', () => {
    const error = new DaemonResponseError('test')
    expect(error).toBeInstanceOf(Error)
  })
})
