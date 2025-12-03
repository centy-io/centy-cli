import { createInterface, type Interface } from 'node:readline'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForDescription } from './prompt-for-description.js'

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

describe('promptForDescription', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should return the entered description', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForDescription(rl, collector.stream)
    input.write('This is a detailed description of the issue.\n')

    const result = await promise
    expect(result).toBe('This is a detailed description of the issue.')
  })

  it('should write prompt message to output', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForDescription(rl, collector.stream)
    input.write('Test\n')

    await promise
    expect(collector.getOutput()).toBe('Enter issue description (optional): ')
  })

  it('should trim whitespace from input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForDescription(rl, collector.stream)
    input.write('  Trimmed Description  \n')

    const result = await promise
    expect(result).toBe('Trimmed Description')
  })

  it('should return empty string for empty input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForDescription(rl, collector.stream)
    input.write('\n')

    const result = await promise
    expect(result).toBe('')
  })
})
