import { Writable } from 'node:stream'
import prompts from 'prompts'
import { describe, expect, it } from 'vitest'
import { promptForRestore } from './prompt-for-restore.js'

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
  it('should add file to restore when user answers yes', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['yes'])

    const files = [{ path: 'README.md', wasInManifest: true }]

    const result = await promptForRestore(stream, files)
    expect(result.restore).toContain('README.md')
    expect(result.skip).toHaveLength(0)
  })

  it('should add file to skip when user answers no', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['no'])

    const files = [{ path: 'README.md', wasInManifest: true }]

    const result = await promptForRestore(stream, files)
    expect(result.skip).toContain('README.md')
    expect(result.restore).toHaveLength(0)
  })

  it('should restore all remaining files when user answers all', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['all'])

    const files = [
      { path: 'file1.md', wasInManifest: true },
      { path: 'file2.md', wasInManifest: true },
      { path: 'file3.md', wasInManifest: true },
    ]

    const result = await promptForRestore(stream, files)
    expect(result.restore).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.skip).toHaveLength(0)
  })

  it('should skip all remaining files when user answers none', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['none'])

    const files = [
      { path: 'file1.md', wasInManifest: true },
      { path: 'file2.md', wasInManifest: true },
      { path: 'file3.md', wasInManifest: true },
    ]

    const result = await promptForRestore(stream, files)
    expect(result.skip).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.restore).toHaveLength(0)
  })

  it('should handle mixed responses', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['yes', 'no'])

    const files = [
      { path: 'file1.md', wasInManifest: true },
      { path: 'file2.md', wasInManifest: true },
    ]

    const result = await promptForRestore(stream, files)
    expect(result.restore).toEqual(['file1.md'])
    expect(result.skip).toEqual(['file2.md'])
  })

  it('should return empty arrays for empty file list', async () => {
    const { stream } = createOutputCollector()

    const result = await promptForRestore(stream, [])
    expect(result.restore).toHaveLength(0)
    expect(result.skip).toHaveLength(0)
  })

  it('should output file deletion message', async () => {
    const { stream, getOutput } = createOutputCollector()
    prompts.inject(['yes'])

    const files = [{ path: 'test.md', wasInManifest: true }]

    await promptForRestore(stream, files)
    expect(getOutput()).toContain('test.md was deleted')
  })
})
