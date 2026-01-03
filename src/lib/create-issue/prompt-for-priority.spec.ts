import { createInterface, type Interface } from 'node:readline'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForPriority } from './prompt-for-priority.js'

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

describe('promptForPriority', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should return low priority when entered', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('low\n')

    const result = await promise
    expect(result).toBe('low')
  })

  it('should return medium priority when entered', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('medium\n')

    const result = await promise
    expect(result).toBe('medium')
  })

  it('should return high priority when entered', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('high\n')

    const result = await promise
    expect(result).toBe('high')
  })

  it('should default to medium on empty input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('\n')

    const result = await promise
    expect(result).toBe('medium')
  })

  it('should accept uppercase input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('HIGH\n')

    const result = await promise
    expect(result).toBe('high')
  })

  it('should write prompt message to output', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('low\n')

    await promise
    expect(collector.getOutput()).toBe(
      'Select priority (low/medium/high) [medium]: '
    )
  })

  it('should prompt again on invalid input', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const promise = promptForPriority(rl, collector.stream)
    input.write('invalid\n')
    // Wait a bit for the re-prompt
    await new Promise(resolve => setTimeout(resolve, 10))
    input.write('high\n')

    const result = await promise
    expect(result).toBe('high')
    expect(collector.getOutput()).toContain('Invalid priority "invalid"')
  })
})
