import { describe, expect, it } from 'vitest'
import { createIssue } from './create-issue.js'

describe('createIssue', () => {
  it('should return error when daemon is not running', async () => {
    const result = await createIssue({
      title: 'Test Issue',
      cwd: '/nonexistent/path',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should require title when not provided and no input stream', async () => {
    const result = await createIssue({
      cwd: '/nonexistent/path',
    })

    expect(result.success).toBe(false)
  })
})
