import { describe, expect, it } from 'vitest'

describe('UnassignIssue command', () => {
  it('should export the UnassignIssue class', async () => {
    const { default: UnassignIssue } = await import('./issue.js')
    expect(UnassignIssue).toBeDefined()
  })

  it('should have a description', async () => {
    const { default: UnassignIssue } = await import('./issue.js')
    expect(UnassignIssue.description).toBeDefined()
    expect(typeof UnassignIssue.description).toBe('string')
  })
})
