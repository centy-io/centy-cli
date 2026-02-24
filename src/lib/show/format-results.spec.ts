import { describe, it, expect, vi } from 'vitest'
import type { IssueWithProject } from '../../daemon/types.js'
import { formatIssueResults } from './format-results.js'

const baseMeta = {
  displayNumber: 1,
  status: 'open',
  priority: 1,
  priorityLabel: 'P1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
  customFields: {},
  draft: false,
  deletedAt: '',
  isOrgIssue: false,
  orgSlug: '',
  orgDisplayNumber: 0,
}

const makeIwp = (
  issueOverrides: Partial<IssueWithProject['issue']> = {}
): IssueWithProject => ({
  issue: {
    id: 'abc',
    issueNumber: 'abc',
    displayNumber: 1,
    title: 'Bug',
    description: '',
    metadata: { ...baseMeta },
    ...issueOverrides,
  },
  projectName: 'proj',
  projectPath: '/proj',
  displayPath: '~/proj',
})

describe('formatIssueResults', () => {
  it('logs all fields for each issue', () => {
    const log = vi.fn()
    formatIssueResults([makeIwp()], log)
    expect(log).toHaveBeenCalledWith('--- Project: proj (/proj) ---')
    expect(log).toHaveBeenCalledWith('Issue #1')
    expect(log).toHaveBeenCalledWith('Status: open')
    expect(log).toHaveBeenCalledWith('Priority: P1')
  })

  it('uses P<n> when priorityLabel is empty', () => {
    const log = vi.fn()
    formatIssueResults(
      [makeIwp({ metadata: { ...baseMeta, priority: 2, priorityLabel: '' } })],
      log
    )
    expect(log).toHaveBeenCalledWith('Priority: P2')
  })

  it('falls back to unknown when metadata is missing', () => {
    const log = vi.fn()
    formatIssueResults([makeIwp({ metadata: undefined })], log)
    expect(log).toHaveBeenCalledWith('Status: unknown')
  })

  it('logs description when present', () => {
    const log = vi.fn()
    formatIssueResults([makeIwp({ description: 'Some text' })], log)
    expect(log).toHaveBeenCalledWith('\nDescription:\nSome text')
  })
})
