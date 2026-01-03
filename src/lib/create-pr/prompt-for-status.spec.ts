import { createInterface, type Interface } from 'node:readline'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForStatus } from './prompt-for-status.js'

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

function createOutputCollector(): {
  stream: Writable
  getOutput: () => string
} {
  let collected = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      collected += chunk.toString()
      callback()
    },
  })
  return {
    stream,
    getOutput: () => collected,
  }
}

describe('promptForStatus', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should return user input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForStatus(rl, collector.stream)
    input.write('open\n')

    const result = await promise
    expect(result).toBe('open')
  })

  it('should return default on empty input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForStatus(rl, collector.stream)
    input.write('\n')

    const result = await promise
    expect(result).toBe('draft')
  })
})
