import { createInterface, type Interface } from 'node:readline'
import { PassThrough } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { askYesNo } from './ask-yes-no.js'

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

describe('askYesNo', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should return true for "y" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', undefined)
    input.write('y\n')

    const result = await promise
    expect(result).toBe(true)
  })

  it('should return true for "yes" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', undefined)
    input.write('yes\n')

    const result = await promise
    expect(result).toBe(true)
  })

  it('should return true for "YES" input (case insensitive)', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', undefined)
    input.write('YES\n')

    const result = await promise
    expect(result).toBe(true)
  })

  it('should return false for "n" input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', undefined)
    input.write('n\n')

    const result = await promise
    expect(result).toBe(false)
  })

  it('should return false for any other input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', undefined)
    input.write('something else\n')

    const result = await promise
    expect(result).toBe(false)
  })

  it('should return false (default) for empty input when defaultYes is false', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', false)
    input.write('\n')

    const result = await promise
    expect(result).toBe(false)
  })

  it('should return true (default) for empty input when defaultYes is true', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', true)
    input.write('\n')

    const result = await promise
    expect(result).toBe(true)
  })

  it('should trim whitespace from input', async () => {
    const { rl, input, destroy } = createMockReadline()
    cleanup = destroy

    const promise = askYesNo(rl, 'Continue?', undefined)
    input.write('  yes  \n')

    const result = await promise
    expect(result).toBe(true)
  })
})
