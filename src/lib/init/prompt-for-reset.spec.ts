import { Writable } from 'node:stream'
import prompts from 'prompts'
import { describe, expect, it } from 'vitest'
import { promptForReset } from './prompt-for-reset.js'

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
  it('should add file to reset when user answers yes', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['yes'])

    const files = [
      { path: 'README.md', currentHash: 'abc', originalHash: 'def' },
    ]

    const result = await promptForReset(stream, files)
    expect(result.reset).toContain('README.md')
    expect(result.skip).toHaveLength(0)
  })

  it('should add file to skip when user answers no', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['no'])

    const files = [
      { path: 'README.md', currentHash: 'abc', originalHash: 'def' },
    ]

    const result = await promptForReset(stream, files)
    expect(result.skip).toContain('README.md')
    expect(result.reset).toHaveLength(0)
  })

  it('should reset all remaining files when user answers all', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['all'])

    const files = [
      { path: 'file1.md', currentHash: 'a1', originalHash: 'b1' },
      { path: 'file2.md', currentHash: 'a2', originalHash: 'b2' },
      { path: 'file3.md', currentHash: 'a3', originalHash: 'b3' },
    ]

    const result = await promptForReset(stream, files)
    expect(result.reset).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.skip).toHaveLength(0)
  })

  it('should skip all remaining files when user answers none', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['none'])

    const files = [
      { path: 'file1.md', currentHash: 'a1', originalHash: 'b1' },
      { path: 'file2.md', currentHash: 'a2', originalHash: 'b2' },
      { path: 'file3.md', currentHash: 'a3', originalHash: 'b3' },
    ]

    const result = await promptForReset(stream, files)
    expect(result.skip).toEqual(['file1.md', 'file2.md', 'file3.md'])
    expect(result.reset).toHaveLength(0)
  })

  it('should handle mixed responses', async () => {
    const { stream } = createOutputCollector()
    prompts.inject(['yes', 'no'])

    const files = [
      { path: 'file1.md', currentHash: 'a1', originalHash: 'b1' },
      { path: 'file2.md', currentHash: 'a2', originalHash: 'b2' },
    ]

    const result = await promptForReset(stream, files)
    expect(result.reset).toEqual(['file1.md'])
    expect(result.skip).toEqual(['file2.md'])
  })

  it('should return empty arrays for empty file list', async () => {
    const { stream } = createOutputCollector()

    const result = await promptForReset(stream, [])
    expect(result.reset).toHaveLength(0)
    expect(result.skip).toHaveLength(0)
  })

  it('should output file modification message', async () => {
    const { stream, getOutput } = createOutputCollector()
    prompts.inject(['yes'])

    const files = [{ path: 'test.md', currentHash: 'a', originalHash: 'b' }]

    await promptForReset(stream, files)
    expect(getOutput()).toContain('test.md has been modified')
  })
})
