import { describe, expect, it, vi } from 'vitest'
import { daemonCreateLink } from '../daemon/daemon-create-link.js'
import { applyLinkFlags } from './apply-link-flags.js'

vi.mock('../daemon/daemon-create-link.js', () => ({
  daemonCreateLink: vi.fn(),
}))

describe('applyLinkFlags', () => {
  it('should do nothing when linkSpecs is empty', async () => {
    const logger = { log: vi.fn(), warn: vi.fn() }
    await applyLinkFlags([], 'src-id', 'issue', '/project', logger)
    expect(daemonCreateLink).not.toHaveBeenCalled()
  })

  it('should warn on invalid link format (no colon)', async () => {
    const logger = { log: vi.fn(), warn: vi.fn() }
    await applyLinkFlags(
      ['invalid-format'],
      'src-id',
      'issue',
      '/project',
      logger
    )
    expect(logger.warn).toHaveBeenCalledWith(
      'Invalid link format "invalid-format" — expected link-type:type:id'
    )
  })

  it('should warn on invalid link target', async () => {
    const logger = { log: vi.fn(), warn: vi.fn() }
    await applyLinkFlags(
      ['blocks:invalid'],
      'src-id',
      'issue',
      '/project',
      logger
    )
    expect(logger.warn).toHaveBeenCalledWith(
      'Invalid link target in "blocks:invalid" — expected type:id'
    )
  })

  it('should call daemonCreateLink and log on success', async () => {
    const mockFn = vi.mocked(daemonCreateLink)
    mockFn.mockResolvedValueOnce({ success: true, error: '' })
    const logger = { log: vi.fn(), warn: vi.fn() }
    await applyLinkFlags(
      ['blocks:issue:2'],
      'src-id',
      'issue',
      '/project',
      logger
    )
    expect(mockFn).toHaveBeenCalledWith({
      projectPath: '/project',
      sourceId: 'src-id',
      sourceType: 'LINK_TARGET_TYPE_ISSUE',
      targetId: '2',
      targetType: 'LINK_TARGET_TYPE_ISSUE',
      linkType: 'blocks',
    })
    expect(logger.log).toHaveBeenCalledWith(
      '  Linked: issue --[blocks]--> issue:2'
    )
  })

  it('should warn when daemonCreateLink fails', async () => {
    const mockFn = vi.mocked(daemonCreateLink)
    mockFn.mockResolvedValueOnce({ success: false, error: 'not found' })
    const logger = { log: vi.fn(), warn: vi.fn() }
    await applyLinkFlags(
      ['blocks:issue:2'],
      'src-id',
      'issue',
      '/project',
      logger
    )
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to create link "blocks:issue:2": not found'
    )
  })
})
