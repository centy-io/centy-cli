import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonGetIssuesByUuid = vi.fn()
const mockSearchItemsByDisplayNumberGlobally = vi.fn()

vi.mock('../../daemon/daemon-get-issues-by-uuid.js', () => ({
  daemonGetIssuesByUuid: (...args: unknown[]) =>
    mockDaemonGetIssuesByUuid(...args),
}))

vi.mock('../../daemon/daemon-search-items-globally.js', () => ({
  searchItemsByDisplayNumberGlobally: (...args: unknown[]) =>
    mockSearchItemsByDisplayNumberGlobally(...args),
}))

vi.mock('../../utils/cross-project-search.js', () => ({
  isValidUuid: vi.fn(id =>
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
      String(id)
    )
  ),
}))

vi.mock('../get-issue/handle-global-search.js', () => ({
  handleGlobalIssueSearch: vi.fn(),
}))

vi.mock('./handle-global-display-number-search.js', () => ({
  handleGlobalDisplayNumberSearch: vi.fn(),
}))

describe('handleGlobalGet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should error for non-issue types', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn((msg: string): never => {
      throw new Error(msg)
    })

    await expect(
      handleGlobalGet('docs', 'some-id', false, log, warn, error)
    ).rejects.toThrow('only supported for issues')
  })

  it('should call searchItemsByDisplayNumberGlobally for display numbers', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn()

    mockSearchItemsByDisplayNumberGlobally.mockResolvedValue({
      items: [],
      errors: [],
    })

    await handleGlobalGet('issues', '42', false, log, warn, error)

    expect(mockSearchItemsByDisplayNumberGlobally).toHaveBeenCalledWith(
      'issues',
      42
    )
    expect(mockDaemonGetIssuesByUuid).not.toHaveBeenCalled()
  })

  it('should output JSON for display number search when jsonMode is true', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn()
    const result = { items: [], errors: [] }

    mockSearchItemsByDisplayNumberGlobally.mockResolvedValue(result)

    await handleGlobalGet('issues', '1', true, log, warn, error)

    expect(log).toHaveBeenCalledWith(JSON.stringify(result, null, 2))
  })

  it('should error for non-UUID non-numeric ids', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn((msg: string): never => {
      throw new Error(msg)
    })

    await expect(
      handleGlobalGet('issues', 'not-a-uuid-or-number', false, log, warn, error)
    ).rejects.toThrow('display number or a valid UUID')
  })

  it('should call daemonGetIssuesByUuid with valid UUID', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn()
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [],
      totalCount: 0,
      errors: [],
    })

    await handleGlobalGet('issues', uuid, false, log, warn, error)

    expect(mockDaemonGetIssuesByUuid).toHaveBeenCalledWith({ uuid })
    expect(mockSearchItemsByDisplayNumberGlobally).not.toHaveBeenCalled()
  })

  it('should output JSON when jsonMode is true for UUID search', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn()
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    const result = { issues: [], totalCount: 0, errors: [] }

    mockDaemonGetIssuesByUuid.mockResolvedValue(result)

    await handleGlobalGet('issues', uuid, true, log, warn, error)

    expect(log).toHaveBeenCalledWith(JSON.stringify(result, null, 2))
  })
})
