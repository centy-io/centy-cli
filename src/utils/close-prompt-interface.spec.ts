import { createInterface, type Interface } from 'node:readline'
import { PassThrough } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import { closePromptInterface } from './close-prompt-interface.js'

describe('closePromptInterface', () => {
  it('should close the readline interface', () => {
    const input = new PassThrough()
    const output = new PassThrough()
    const rl = createInterface({ input, output })

    const closeSpy = vi.spyOn(rl, 'close')

    closePromptInterface(rl)

    expect(closeSpy).toHaveBeenCalledOnce()

    input.destroy()
    output.destroy()
  })

  it('should work with already closed interface', () => {
    const input = new PassThrough()
    const output = new PassThrough()
    const rl = createInterface({ input, output })

    rl.close()

    // Calling close again should not throw
    expect(() => closePromptInterface(rl)).not.toThrow()

    input.destroy()
    output.destroy()
  })
})
