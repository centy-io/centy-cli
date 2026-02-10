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

  describe('plain string errors (backward compatibility)', () => {
    it('should use raw string as message', () => {
      const error = new DaemonResponseError('Issue not found')
      expect(error.message).toBe('Issue not found')
      expect(error.errorResponse).toBeNull()
      expect(error.logs).toBeUndefined()
      expect(error.errorCode).toBeUndefined()
      expect(error.tip).toBeUndefined()
    })

    it('should handle non-JSON strings', () => {
      const error = new DaemonResponseError(
        'Something went wrong: details here'
      )
      expect(error.message).toBe('Something went wrong: details here')
      expect(error.errorResponse).toBeNull()
    })
  })

  describe('structured JSON error responses', () => {
    it('should parse a full structured error response', () => {
      const jsonError = JSON.stringify({
        cwd: '/path/to/project',
        logs: '~/.centy/logs/centy-daemon.log',
        messages: [
          {
            message: 'Issue not found',
            tip: "Check that the issue ID or display number is correct, or run 'centy list issues' to see available issues",
            code: 'ISSUE_NOT_FOUND',
          },
        ],
      })

      const error = new DaemonResponseError(jsonError)
      expect(error.message).toBe(
        'Issue not found\n' +
          "Tip: Check that the issue ID or display number is correct, or run 'centy list issues' to see available issues\n" +
          'Logs: ~/.centy/logs/centy-daemon.log'
      )
      expect(error.errorResponse).not.toBeNull()
      expect(error.errorCode).toBe('ISSUE_NOT_FOUND')
      expect(error.tip).toBe(
        "Check that the issue ID or display number is correct, or run 'centy list issues' to see available issues"
      )
      expect(error.logs).toBe('~/.centy/logs/centy-daemon.log')
    })

    it('should parse error without tip or logs', () => {
      const jsonError = JSON.stringify({
        messages: [{ message: 'Config not found', code: 'CONFIG_NOT_FOUND' }],
      })

      const error = new DaemonResponseError(jsonError)
      expect(error.message).toBe('Config not found')
      expect(error.errorCode).toBe('CONFIG_NOT_FOUND')
      expect(error.tip).toBeUndefined()
      expect(error.logs).toBeUndefined()
    })

    it('should handle multiple messages', () => {
      const jsonError = JSON.stringify({
        messages: [
          { message: 'First error', tip: 'Fix first' },
          { message: 'Second error', tip: 'Fix second' },
        ],
      })

      const error = new DaemonResponseError(jsonError)
      expect(error.message).toBe(
        'First error\nTip: Fix first\nSecond error\nTip: Fix second'
      )
      expect(error.errorCode).toBeUndefined()
      expect(error.tip).toBe('Fix first')
    })

    it('should expose the full errorResponse', () => {
      const responseObj = {
        cwd: '/my/project',
        logs: '/tmp/logs.log',
        messages: [
          { message: 'Error occurred', code: 'SOME_CODE', tip: 'Try again' },
        ],
      }
      const error = new DaemonResponseError(JSON.stringify(responseObj))
      expect(error.errorResponse).toEqual(responseObj)
    })

    it('should fall back for JSON without messages array', () => {
      const jsonStr = JSON.stringify({ error: 'something' })
      const error = new DaemonResponseError(jsonStr)
      expect(error.errorResponse).toBeNull()
      expect(error.message).toBe(jsonStr)
    })

    it('should handle empty messages array', () => {
      const jsonError = JSON.stringify({
        logs: '/some/logs',
        messages: [],
      })
      const error = new DaemonResponseError(jsonError)
      expect(error.message).toBe('Logs: /some/logs')
      expect(error.errorCode).toBeUndefined()
      expect(error.tip).toBeUndefined()
      expect(error.logs).toBe('/some/logs')
    })
  })
})
