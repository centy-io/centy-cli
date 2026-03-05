import { describe, it, expect, vi } from 'vitest'
import type { GenericItem } from '../../daemon/types.js'
import { formatIssuePlain } from './format-issue-output.js'

const baseMeta = {
  displayNumber: 1,
  status: 'open',
  priority: 2,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-02',
  customFields: {},
  deletedAt: '',
}

const baseIssue: GenericItem = {
  id: 'abc',
  itemType: 'issues',
  title: 'Bug',
  body: '',
}

describe('formatIssuePlain', () => {
  it('logs fields with metadata present', () => {
    const log = vi.fn()
    const issue: GenericItem = { ...baseIssue, metadata: { ...baseMeta } }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('Issue #1')
    expect(log).toHaveBeenCalledWith('Status: open')
    expect(log).toHaveBeenCalledWith('Priority: P2')
  })

  it('logs priority as P<n> from metadata', () => {
    const log = vi.fn()
    const issue: GenericItem = {
      ...baseIssue,
      metadata: { ...baseMeta, priority: 3 },
    }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('Priority: P3')
  })

  it('falls back to unknowns when metadata is missing', () => {
    const log = vi.fn()
    const issue: GenericItem = { ...baseIssue, metadata: undefined }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('Status: unknown')
    expect(log).toHaveBeenCalledWith('Priority: P?')
  })

  it('logs body when present', () => {
    const log = vi.fn()
    const issue: GenericItem = {
      ...baseIssue,
      body: 'A description',
      metadata: undefined,
    }
    formatIssuePlain(issue, log)
    expect(log).toHaveBeenCalledWith('\nDescription:\nA description')
  })
})
