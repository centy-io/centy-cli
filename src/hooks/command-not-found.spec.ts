import { describe, it, expect, vi, beforeEach } from 'vitest'

const { default: hook } = await import('./command-not-found.js')

describe('command_not_found hook', () => {
  const mockError = vi.fn<[string, { exit: number }?], void>()

  const makeOpts = (id: string, commandIDs: string[] = []) => ({
    id,
    config: { commandIDs },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call error with the unknown command name', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('foobar')])

    expect(mockError).toHaveBeenCalledOnce()
    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('foobar')
  })

  it('should include syntax reference', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('centy <command> [subcommand] [args] [flags]')
  })

  it('should include help pointer', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('centy --help')
  })

  it('should include LLM callout', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('centy llm')
  })

  it('should include GitHub issue creation hint', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain(
      'gh issue create --repo centy-io/centy-cli --title "Missing command: foobar"'
    )
  })

  it('should suggest a close command when one exists', async () => {
    await Reflect.apply(hook, { error: mockError }, [
      makeOpts('creat', ['create', 'close', 'list']),
    ]) // cspell:ignore creat

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('Did you mean: create')
  })

  it('should not suggest when no close match exists', async () => {
    await Reflect.apply(hook, { error: mockError }, [
      makeOpts('xyzqwerty', ['create', 'list', 'get']),
    ]) // cspell:ignore xyzqwerty

    const message: string = mockError.mock.calls[0][0]
    expect(message).not.toContain('Did you mean')
  })

  it('should exit with code 2', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('foobar')])

    const options: { exit: number } | undefined = mockError.mock.calls[0][1]
    expect(options).toEqual({ exit: 2 })
  })
})
