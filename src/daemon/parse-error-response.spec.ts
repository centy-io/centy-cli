import { describe, expect, it } from 'vitest'
import { tryParseErrorResponse } from './parse-error-response.js'

describe('tryParseErrorResponse', () => {
  it('should return null for plain string errors', () => {
    expect(tryParseErrorResponse('Issue not found')).toBeNull()
  })

  it('should return null for invalid JSON', () => {
    expect(tryParseErrorResponse('{not valid json}')).toBeNull()
  })

  it('should return null for JSON without messages array', () => {
    expect(tryParseErrorResponse(JSON.stringify({ error: 'oops' }))).toBeNull()
  })

  it('should parse a structured error response', () => {
    const json = JSON.stringify({
      cwd: '/project',
      logs: '~/.centy/logs/centy-daemon.log',
      messages: [
        {
          message: 'Issue not found',
          tip: 'Run centy list issues',
          code: 'ISSUE_NOT_FOUND',
        },
      ],
    })

    const result = tryParseErrorResponse(json)
    expect(result).not.toBeNull()
    expect(result!.response.cwd).toBe('/project')
    expect(result!.response.logs).toBe('~/.centy/logs/centy-daemon.log')
    expect(result!.code).toBe('ISSUE_NOT_FOUND')
    expect(result!.tip).toBe('Run centy list issues')
    expect(result!.formatted).toBe(
      'Issue not found\nTip: Run centy list issues\nLogs: ~/.centy/logs/centy-daemon.log'
    )
  })

  it('should handle messages without tip or code', () => {
    const json = JSON.stringify({
      messages: [{ message: 'Something failed' }],
    })

    const result = tryParseErrorResponse(json)
    expect(result).not.toBeNull()
    expect(result!.formatted).toBe('Something failed')
    expect(result!.code).toBeUndefined()
    expect(result!.tip).toBeUndefined()
  })

  it('should handle empty messages array', () => {
    const json = JSON.stringify({ logs: '/tmp/logs', messages: [] })

    const result = tryParseErrorResponse(json)
    expect(result).not.toBeNull()
    expect(result!.formatted).toBe('Logs: /tmp/logs')
    expect(result!.code).toBeUndefined()
    expect(result!.tip).toBeUndefined()
  })
})
