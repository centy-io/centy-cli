import { describe, it, expect, vi } from 'vitest'
import type { GenericItem } from '../../daemon/types.js'
import { formatDocPlain } from './format-doc-output.js'

describe('formatDocPlain', () => {
  it('logs all fields when metadata is present', () => {
    const log = vi.fn()
    const doc: GenericItem = {
      id: 'my-doc',
      itemType: 'docs',
      title: 'My Doc',
      body: 'Hello',
      metadata: {
        displayNumber: 0,
        status: '',
        priority: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        deletedAt: '',
        customFields: {},
      },
    }
    formatDocPlain(doc, log)
    expect(log).toHaveBeenCalledWith('Title: My Doc')
    expect(log).toHaveBeenCalledWith('Slug: my-doc')
    expect(log).toHaveBeenCalledWith('Created: 2024-01-01')
    expect(log).toHaveBeenCalledWith('Updated: 2024-01-02')
  })

  it('falls back to "unknown" when metadata is missing', () => {
    const log = vi.fn()
    const doc: GenericItem = {
      id: 'x',
      itemType: 'docs',
      title: 'X',
      body: '',
      metadata: undefined,
    }
    formatDocPlain(doc, log)
    expect(log).toHaveBeenCalledWith('Created: unknown')
    expect(log).toHaveBeenCalledWith('Updated: unknown')
  })
})
