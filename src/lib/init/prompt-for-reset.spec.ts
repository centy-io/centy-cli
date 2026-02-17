import { createInterface, type Interface } from 'node:readline'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForReset } from './prompt-for-reset.js'

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

describe('promptForReset', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (!cleanup) {
      return
    }

    cleanup()
    cleanup = undefined
  })

  it('should add file to reset when user answers yes', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'README.md', currentHash: 'abc', originalHash: 'def' },
    ]

    const promise = promptForReset(rl, collector.stream, files)
    input.write('y\n')

    const result = await promise
    expect(result.reset).toContain('README.md')
    expect(result.skip).toHaveLength(0)
  })

  it('should add file to skip when user answers no', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'README.md', currentHash: 'abc', originalHash: 'def' },
    ]

    const promise = promptForReset(rl, collector.stream, files)
    input.write('n\n')

    const result = await promise
    expect(result.skip).toContain('README.md')
    expect(result.reset).toHaveLength(0)
  })

  it('should reset all remaining files when user answers all', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'file1.md', currentHash: 'a1', originalHash: 'b1' },
      { path: 'file2.md', currentHash: 'a2', originalHash: 'b2' },
      { path: 'file3.md', currentHash: 'a3', originalHash: 'b3' },
    ]

    const promise = promptForReset(rl, collector.stream, files)
    input.write('a\n')

    const result = await promise
    expect(result.reset).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.skip).toHaveLength(0)
  })

  it('should skip all remaining files when user answers none', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'file1.md', currentHash: 'a1', originalHash: 'b1' },
      { path: 'file2.md', currentHash: 'a2', originalHash: 'b2' },
      { path: 'file3.md', currentHash: 'a3', originalHash: 'b3' },
    ]

    const promise = promptForReset(rl, collector.stream, files)
    input.write('none\n')

    const result = await promise
    expect(result.skip).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.reset).toHaveLength(0)
  })

  it('should handle mixed responses', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'file1.md', currentHash: 'a1', originalHash: 'b1' },
      { path: 'file2.md', currentHash: 'a2', originalHash: 'b2' },
    ]

    const promise = promptForReset(rl, collector.stream, files)
    input.write('y\n')

    // Wait a bit for the first question to be processed
    await new Promise(resolve => setTimeout(resolve, 10))
    input.write('n\n')

    const result = await promise
    expect(result.reset).toEqual(['file1.md'])
    expect(result.skip).toEqual(['file2.md'])
  })

  it('should return empty arrays for empty file list', async () => {
    const { rl, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const result = await promptForReset(rl, collector.stream, [])
    expect(result.reset).toHaveLength(0)
    expect(result.skip).toHaveLength(0)
  })

  it('should output file modification message', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [{ path: 'test.md', currentHash: 'a', originalHash: 'b' }]

    const promise = promptForReset(rl, collector.stream, files)
    input.write('y\n')

    await promise
    expect(collector.getOutput()).toContain('test.md has been modified')
  })
})
