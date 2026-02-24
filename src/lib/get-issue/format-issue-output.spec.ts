import { describe, it, expect, vi } from 'vitest'
import type { Issue } from '../../daemon/types.js'
import { formatIssuePlain } from './format-issue-output.js'

const baseMeta = {
  displayNumber: 1,
  status: 'open',
  priority: 2,
  priorityLabel: 'High',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
  customFields: {},
  draft: false,
  deletedAt: '',
  isOrgIssue: false,
  orgSlug: '',
  orgDisplayNumber: 0,
}

const baseIssue: Issue = {
  id: 'abc',
  issueNumber: 'abc',
  displayNumber: 1,
  title: 'Bug',
  description: '',
}

describe('formatIssuePlain', () => {
  it('logs fields with metadata and priorityLabel present', () => {
    const log = vi.fn()
    const issue: Issue = { ...baseIssue, metadata: { ...baseMeta } }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('Issue #1')
    expect(log).toHaveBeenCalledWith('Status: open')
    expect(log).toHaveBeenCalledWith('Priority: High')
  })

  it('falls back to P<n> when priorityLabel is empty', () => {
    const log = vi.fn()
    const issue: Issue = {
      ...baseIssue,
      metadata: { ...baseMeta, priority: 3, priorityLabel: '' },
    }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('Priority: P3')
  })

  it('falls back to unknowns when metadata is missing', () => {
    const log = vi.fn()
    const issue: Issue = { ...baseIssue, metadata: undefined }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('Status: unknown')
    expect(log).toHaveBeenCalledWith('Priority: P?')
  })

  it('logs description when present', () => {
    const log = vi.fn()
    const issue: Issue = {
      ...baseIssue,
      description: 'A description',
      metadata: undefined,
    }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('\nDescription:\nA description')
  })
})
