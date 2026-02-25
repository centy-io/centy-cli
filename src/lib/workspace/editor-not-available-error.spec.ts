import { describe, expect, it } from 'vitest'
import { EditorNotAvailableError } from './editor-not-available-error.js'

describe('EditorNotAvailableError', () => {
  it('should include the editor id and available editors in the message', () => {
    const error = new EditorNotAvailableError('zed', ['vscode', 'terminal'])

    expect(error.message).toContain('zed')
    expect(error.message).toContain('vscode')
    expect(error.message).toContain('terminal')
    expect(error.name).toBe('EditorNotAvailableError')
  })

  it('should be an instance of Error', () => {
    const error = new EditorNotAvailableError('zed', ['vscode'])

    expect(error).toBeInstanceOf(Error)
  })
})
