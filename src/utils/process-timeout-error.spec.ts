import { describe, it, expect } from 'vitest'
import { ProcessTimeoutError } from './process-timeout-error.js'

describe('ProcessTimeoutError', () => {
  it('should create an error with the correct message', () => {
    const error = new ProcessTimeoutError('daemon install', 30000)
    expect(error.message).toBe(
      "Operation 'daemon install' timed out after 30000ms. The process may be hanging or waiting for input."
    )
  })

  it('should have the correct name', () => {
    const error = new ProcessTimeoutError('test', 1000)
    expect(error.name).toBe('ProcessTimeoutError')
  })

  it('should be an instance of Error', () => {
    const error = new ProcessTimeoutError('test', 1000)
    expect(error).toBeInstanceOf(Error)
  })
})
