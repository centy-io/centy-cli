import { createInterface, type Interface } from 'node:readline'
import { PassThrough, Writable } from 'node:stream'
import { describe, expect, it, afterEach } from 'vitest'
import { promptForRestore } from './prompt-for-restore.js'

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

describe('promptForRestore', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  it('should add file to restore when user answers yes', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [{ path: 'README.md', wasInManifest: true }]

    const promise = promptForRestore(rl, collector.stream, files)
    input.write('y\n')

    const result = await promise
    expect(result.restore).toContain('README.md')
    expect(result.skip).toHaveLength(0)
  })

  it('should add file to skip when user answers no', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [{ path: 'README.md', wasInManifest: true }]

    const promise = promptForRestore(rl, collector.stream, files)
    input.write('n\n')

    const result = await promise
    expect(result.skip).toContain('README.md')
    expect(result.restore).toHaveLength(0)
  })

  it('should restore all remaining files when user answers all', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'file1.md', wasInManifest: true },
      { path: 'file2.md', wasInManifest: true },
      { path: 'file3.md', wasInManifest: true },
    ]

    const promise = promptForRestore(rl, collector.stream, files)
    input.write('a\n')

    const result = await promise
    expect(result.restore).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.skip).toHaveLength(0)
  })

  it('should skip all remaining files when user answers none', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'file1.md', wasInManifest: true },
      { path: 'file2.md', wasInManifest: true },
      { path: 'file3.md', wasInManifest: true },
    ]

    const promise = promptForRestore(rl, collector.stream, files)
    input.write('none\n')

    const result = await promise
    expect(result.skip).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.restore).toHaveLength(0)
  })

  it('should handle mixed responses', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [
      { path: 'file1.md', wasInManifest: true },
      { path: 'file2.md', wasInManifest: true },
    ]

    const promise = promptForRestore(rl, collector.stream, files)
    input.write('y\n')

    // Wait a bit for the first question to be processed
    await new Promise(resolve => setTimeout(resolve, 10))
    input.write('n\n')

    const result = await promise
    expect(result.restore).toEqual(['file1.md'])
    expect(result.skip).toEqual(['file2.md'])
  })

  it('should return empty arrays for empty file list', async () => {
    const { rl, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const result = await promptForRestore(rl, collector.stream, [])
    expect(result.restore).toHaveLength(0)
    expect(result.skip).toHaveLength(0)
  })

  it('should output file deletion message', async () => {
    const { rl, input, destroy } = createMockReadline()
    const collector = createOutputCollector()
    cleanup = destroy

    const files = [{ path: 'test.md', wasInManifest: true }]

    const promise = promptForRestore(rl, collector.stream, files)
    input.write('y\n')

    await promise
    expect(collector.getOutput()).toContain('test.md was deleted')
  })
})
