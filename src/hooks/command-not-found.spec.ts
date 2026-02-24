import { describe, it, expect, vi, beforeEach } from 'vitest'

const { default: hook } = await import('./command-not-found.js')

describe('command_not_found hook', () => {
  const mockError = vi.fn<[string, { exit: number }?], void>()
  const mockRunCommand = vi.fn()

  const makeOpts = (
    id: string,
    commandIDs: string[] = [],
    argv?: string[]
  ) => ({
    id,
    argv,
    config: { commandIDs, runCommand: mockRunCommand },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockRunCommand.mockResolvedValue(undefined)
  })

  it('should call error with the unknown command name', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('123foobar')])

    expect(mockError).toHaveBeenCalledOnce()
    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('123foobar')
  })

  it('should include syntax reference', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('123foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('centy <command> [subcommand] [args] [flags]')
  })

  it('should include help pointer', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('123foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('centy --help')
  })

  it('should include LLM callout', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('123foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('centy llm')
  })

  it('should include GitHub issue creation hint', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('123foobar')])

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain(
      'gh issue create --repo centy-io/centy-cli --title "Missing command: 123foobar"'
    )
  })

  it('should suggest a close command when one exists', async () => {
    await Reflect.apply(hook, { error: mockError }, [
      makeOpts('123creat', ['create', 'close', 'list']),
    ]) // cspell:ignore creat

    const message: string = mockError.mock.calls[0][0]
    expect(message).toContain('Did you mean: create')
  })

  it('should not suggest when no close match exists', async () => {
    await Reflect.apply(hook, { error: mockError }, [
      makeOpts('123xyzqwerty', ['create', 'list', 'get']),
    ]) // cspell:ignore xyzqwerty

    const message: string = mockError.mock.calls[0][0]
    expect(message).not.toContain('Did you mean')
  })

  it('should exit with code 2', async () => {
    await Reflect.apply(hook, { error: mockError }, [makeOpts('123foobar')])

    const options: { exit: number } | undefined = mockError.mock.calls[0][1]
    expect(options).toEqual({ exit: 2 })
  })

  describe('item type shorthands', () => {
    it('should route "centy <type> <id>" to get command', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('issue', [], ['issue', '1'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('get', ['issue', '1'])
      expect(mockError).not.toHaveBeenCalled()
    })

    it('should route "centy <types>" to list command', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('issues', [], ['issues'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('list', ['issues'])
      expect(mockError).not.toHaveBeenCalled()
    })

    it('should route with flags to list when no positional id', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('issues', [], ['issues', '--status', 'open'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('list', [
        'issues',
        '--status',
        'open',
      ])
      expect(mockError).not.toHaveBeenCalled()
    })

    it('should route with flags to get when positional id present', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('issue', [], ['issue', '1', '--json'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('get', [
        'issue',
        '1',
        '--json',
      ])
      expect(mockError).not.toHaveBeenCalled()
    })

    it('should route custom item types generically', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('epic', [], ['epic', '5'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('get', ['epic', '5'])
    })

    it('should route plural custom item types to list', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('epics', [], ['epics'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('list', ['epics'])
    })

    it('should not intercept commands with colons', async () => {
      await Reflect.apply(hook, { error: mockError }, [makeOpts('foo:bar', [])])

      expect(mockRunCommand).not.toHaveBeenCalled()
      expect(mockError).toHaveBeenCalled()
    })

    it('should not intercept commands starting with numbers', async () => {
      await Reflect.apply(hook, { error: mockError }, [makeOpts('123abc', [])])

      expect(mockRunCommand).not.toHaveBeenCalled()
      expect(mockError).toHaveBeenCalled()
    })

    it('should handle argv without leading command id', async () => {
      await Reflect.apply(
        hook,
        { error: mockError, config: { runCommand: mockRunCommand } },
        [makeOpts('bug', [], ['5'])]
      )

      expect(mockRunCommand).toHaveBeenCalledWith('get', ['bug', '5'])
    })
  })
})
