import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockListItemsGlobally = vi.fn()

vi.mock('../../daemon/daemon-list-items-globally.js', () => ({
  listItemsGlobally: (...args: unknown[]) => mockListItemsGlobally(...args),
}))

describe('handleGlobalNext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log no items message when result is empty', async () => {
    const { handleGlobalNext } = await import('./handle-global-next.js')
    mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })
    const logs: string[] = []
    await handleGlobalNext('issues', 'issue', '{}', 'open', false, msg =>
      logs.push(msg)
    )
    expect(logs[0]).toBe('No open issue found across projects.')
  })

  it('should log formatted item line with project name', async () => {
    const { handleGlobalNext } = await import('./handle-global-next.js')
    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item: {
            id: '1',
            title: 'Bug fix',
            body: '',
            metadata: { displayNumber: 5, status: 'open', priority: 1 },
          },
          projectName: 'my-proj',
          projectPath: '/projects/my-proj',
          displayPath: 'my-proj',
        },
      ],
      errors: [],
    })
    const logs: string[] = []
    await handleGlobalNext('issues', 'issue', '{}', 'open', false, msg =>
      logs.push(msg)
    )
    expect(logs[0]).toContain('[my-proj]')
    expect(logs[0]).toContain('#5')
    expect(logs[0]).toContain('Bug fix')
  })

  it('should output JSON with projectName when jsonMode is true', async () => {
    const { handleGlobalNext } = await import('./handle-global-next.js')
    mockListItemsGlobally.mockResolvedValue({
      items: [
        {
          item: { id: '1', title: 'Bug', body: '', metadata: undefined },
          projectName: 'proj',
          projectPath: '/p',
          displayPath: 'proj',
        },
      ],
      errors: [],
    })
    const logs: string[] = []
    await handleGlobalNext('issues', 'issue', '{}', 'open', true, msg =>
      logs.push(msg)
    )
    const parsed = JSON.parse(logs[0])
    expect(parsed).toMatchObject({ id: '1', projectName: 'proj' })
  })

  it('should call listItemsGlobally with limit 1 and offset 0', async () => {
    const { handleGlobalNext } = await import('./handle-global-next.js')
    mockListItemsGlobally.mockResolvedValue({ items: [], errors: [] })
    await handleGlobalNext(
      'bugs',
      'bug',
      '{"status":{"$eq":"open"}}',
      'open',
      false,
      () => {}
    )
    expect(mockListItemsGlobally).toHaveBeenCalledWith(
      'bugs',
      '{"status":{"$eq":"open"}}',
      1,
      0
    )
  })
})
