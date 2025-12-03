import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { createPromptInterface } from './create-prompt-interface.js'

describe('createPromptInterface', () => {
  const cleanupFns: Array<() => void> = []

  afterEach(() => {
    for (const fn of cleanupFns) {
      fn()
    }
    cleanupFns.length = 0
  })

  it('should create a readline interface with provided streams', () => {
    const input = new PassThrough()
    const output = new Writable({ write: (_chunk, _enc, cb) => cb() })
    cleanupFns.push(() => {
      input.destroy()
      output.destroy()
    })

    const rl = createPromptInterface(input, output)
    cleanupFns.push(() => rl.close())

    expect(rl).toBeDefined()
    expect(typeof rl.question).toBe('function')
    expect(typeof rl.close).toBe('function')
  })

  it('should create a readline interface with default streams when none provided', () => {
    // This test verifies the function works without explicit streams
    // We can't easily test process.stdin/stdout, but we verify the function runs
    const rl = createPromptInterface()
    cleanupFns.push(() => rl.close())

    expect(rl).toBeDefined()
    expect(typeof rl.question).toBe('function')
  })

  it('should create a readline interface with only input stream provided', () => {
    const input = new PassThrough()
    cleanupFns.push(() => input.destroy())

    const rl = createPromptInterface(input)
    cleanupFns.push(() => rl.close())

    expect(rl).toBeDefined()
    expect(typeof rl.question).toBe('function')
  })
})
