import { describe, expect, it, vi } from 'vitest'

const mockDaemonGetIssuesByUuid = vi.fn()

vi.mock('../../daemon/daemon-get-issues-by-uuid.js', () => ({
  daemonGetIssuesByUuid: (...args: unknown[]) =>
    mockDaemonGetIssuesByUuid(...args),
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

describe('handleGlobalGet', () => {
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

  it('should error for non-UUID ids', async () => {
    const { handleGlobalGet } = await import('./handle-global-get.js')
    const log = vi.fn()
    const warn = vi.fn()
    const error = vi.fn((msg: string): never => {
      throw new Error(msg)
    })

    await expect(
      handleGlobalGet('issues', '1', false, log, warn, error)
    ).rejects.toThrow('requires a valid UUID')
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
  })

  it('should output JSON when jsonMode is true', async () => {
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
