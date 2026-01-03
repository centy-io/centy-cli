import { createInterface, type Interface } from 'node:readline'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForTitle } from './prompt-for-title.js'

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

describe('promptForTitle', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should return the entered title', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForTitle(rl, collector.stream)
    input.write('My Issue Title\n')

    const result = await promise
    expect(result).toBe('My Issue Title')
  })

  it('should write prompt message to output', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForTitle(rl, collector.stream)
    input.write('Test\n')

    await promise
    expect(collector.getOutput()).toBe('Enter issue title: ')
  })

  it('should trim whitespace from input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForTitle(rl, collector.stream)
    input.write('  Trimmed Title  \n')

    const result = await promise
    expect(result).toBe('Trimmed Title')
  })

  it('should return empty string for empty input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForTitle(rl, collector.stream)
    input.write('\n')

    const result = await promise
    expect(result).toBe('')
  })
})
