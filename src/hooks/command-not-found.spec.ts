import { describe, it, expect, vi, beforeEach } from 'vitest'

const { default: hook } = await import('./command-not-found.js')

describe('command_not_found hook', () => {
  const mockError = vi.fn()

  const makeOpts = (id: string, commandIDs: string[] = []) => ({
    id,
    config: { commandIDs },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call error with the unknown command name', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError } as never, makeOpts('foobar') as never)

    expect(mockError).toHaveBeenCalledOnce()
    const [message] = mockError.mock.calls[0] as [string]
    expect(message).toContain('foobar')
  })

  it('should include syntax reference', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError } as never, makeOpts('foobar') as never)

    const [message] = mockError.mock.calls[0] as [string]
    expect(message).toContain('centy <command> [subcommand] [args] [flags]')
  })

  it('should include help pointer', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError } as never, makeOpts('foobar') as never)

    const [message] = mockError.mock.calls[0] as [string]
    expect(message).toContain('centy --help')
  })

  it('should include LLM callout', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError } as never, makeOpts('foobar') as never)

    const [message] = mockError.mock.calls[0] as [string]
    expect(message).toContain('centy llm')
  })

  it('should include GitHub issue creation hint', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError } as never, makeOpts('foobar') as never)

    const [message] = mockError.mock.calls[0] as [string]
    expect(message).toContain(
      'gh issue create --repo centy-io/centy-cli --title "Missing command: foobar"'
    )
  })

  it('should suggest a close command when one exists', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call(
      { error: mockError } as never,
      makeOpts('creat', ['create', 'close', 'list']) as never
    )

    const [message] = mockError.mock.calls[0] as [string]
    expect(message).toContain('Did you mean: create')
  })

  it('should not suggest when no close match exists', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call(
      { error: mockError } as never,
      makeOpts('xyzqwerty', ['create', 'list', 'get']) as never
    )

    const [message] = mockError.mock.calls[0] as [string]
    expect(message).not.toContain('Did you mean')
  })

  it('should exit with code 2', async () => {
    // eslint-disable-next-line no-restricted-syntax
    await hook.call({ error: mockError } as never, makeOpts('foobar') as never)

    const [, options] = mockError.mock.calls[0] as [string, { exit: number }]
    expect(options).toEqual({ exit: 2 })
  })
})
