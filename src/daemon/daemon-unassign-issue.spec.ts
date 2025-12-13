import { describe, expect, it } from 'vitest'

describe('daemonUnassignIssue', () => {
  it('should export the daemonUnassignIssue function', async () => {
    const { daemonUnassignIssue } = await import('./daemon-unassign-issue.js')
    expect(daemonUnassignIssue).toBeDefined()
    expect(typeof daemonUnassignIssue).toBe('function')
  })
})
