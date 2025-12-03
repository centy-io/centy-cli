import { createInterface, type Interface } from 'node:readline'
import { PassThrough } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { askYesNoAllNone } from './ask-yes-no-all-none.js'

function createMockReadline(): {
  rl: Interface
  input: PassThrough
  destroy: () => void
} {
  const input = new PassThrough()
  const output = new PassThrough()
  const rl = createInterface({ input, output })
  return {
    rl,
    input,
    destroy: () => {
      rl.close()
      input.destroy()
      output.destroy()
    },
  }
}

describe('askYesNoAllNone', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should return "yes" for "y" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('y\n')

    const result = await promise
    expect(result).toBe('yes')
  })

  it('should return "yes" for "yes" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('yes\n')

    const result = await promise
    expect(result).toBe('yes')
  })

  it('should return "yes" for "YES" input (case insensitive)', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('YES\n')

    const result = await promise
    expect(result).toBe('yes')
  })

  it('should return "all" for "a" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('a\n')

    const result = await promise
    expect(result).toBe('all')
  })

  it('should return "all" for "all" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('all\n')

    const result = await promise
    expect(result).toBe('all')
  })

  it('should return "none" for "none" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('none\n')

    const result = await promise
    expect(result).toBe('none')
  })

  it('should return "no" for "n" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('n\n')

    const result = await promise
    expect(result).toBe('no')
  })

  it('should return "no" for any other input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('something else\n')

    const result = await promise
    expect(result).toBe('no')
  })

  it('should return "no" for empty input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('\n')

    const result = await promise
    expect(result).toBe('no')
  })

  it('should trim whitespace from input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNoAllNone(rl, 'Continue?')
    input.write('  yes  \n')

    const result = await promise
    expect(result).toBe('yes')
  })
})
