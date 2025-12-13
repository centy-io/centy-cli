import { describe, expect, it } from 'vitest'

describe('AssignIssue command', () => {
  it('should export the AssignIssue class', async () => {
    const { default: AssignIssue } = await import('./issue.js')
    expect(AssignIssue).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: AssignIssue } = await import('./issue.js')
    expect(AssignIssue.description).toBeDefined()
    expect(typeof AssignIssue.description).toBe('string')
  })
})
