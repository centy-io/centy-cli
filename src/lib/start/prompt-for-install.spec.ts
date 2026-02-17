import { createInterface, type Interface } from 'node:readline'
import { PassThrough } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForInstall } from './prompt-for-install.js'

function createMockReadline(): {
  rl: Interface
  input: PassThrough
  output: PassThrough
  destroy: () => void
} {
  const input = new PassThrough()
  const output = new PassThrough()
  const rl = createInterface({ input, output })
  return {
    rl,
    input,
    output,
    destroy: () => {
      rl.close()
      input.destroy()
      output.destroy()
    },
  }
}

describe('promptForInstall', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (!cleanup) {
      return
    }

    cleanup()
    cleanup = undefined
  })

  it('should return true when user answers yes', async () => {
    const { rl, input, output, destroy } = createMockReadline()
    cleanup = destroy

    const promise = promptForInstall({
      rl,
      output,
      daemonPath: '/path/to/daemon',
    })
    input.write('y\n')

    const result = await promise
    expect(result).toBe(true)
  })

  it('should return false when user answers no', async () => {
    const { rl, input, output, destroy } = createMockReadline()
    cleanup = destroy

    const promise = promptForInstall({
      rl,
      output,
      daemonPath: '/path/to/daemon',
    })
    input.write('n\n')

    const result = await promise
    expect(result).toBe(false)
  })

  it('should return false for empty input (default is no)', async () => {
    const { rl, input, output, destroy } = createMockReadline()
    cleanup = destroy

    const promise = promptForInstall({
      rl,
      output,
      daemonPath: '/path/to/daemon',
    })
    input.write('\n')

    const result = await promise
    expect(result).toBe(false)
  })

  it('should display daemon path in output', async () => {
    const { rl, input, output, destroy } = createMockReadline()
    cleanup = destroy

    const outputChunks: string[] = []
    output.on('data', chunk => {
      outputChunks.push(chunk.toString())
    })

    const promise = promptForInstall({
      rl,
      output,
      daemonPath: '/custom/daemon/path',
    })
    input.write('n\n')

    await promise

    const fullOutput = outputChunks.join('')
    expect(fullOutput).toContain('/custom/daemon/path')
    expect(fullOutput).toContain('Daemon not found')
  })
})
