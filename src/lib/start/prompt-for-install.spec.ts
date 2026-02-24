import { Writable } from 'node:stream'
import prompts from 'prompts'
import { describe, expect, it } from 'vitest'
import { promptForInstall } from './prompt-for-install.js'

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

describe('promptForInstall', () => {
  it('should return true when user confirms install', async () => {
    const { stream } = createOutputCollector()
    prompts.inject([true])

    const result = await promptForInstall({
      output: stream,
      daemonPath: '/path/to/daemon',
    })

    expect(result).toBe(true)
  })

  it('should return false when user declines install', async () => {
    const { stream } = createOutputCollector()
    prompts.inject([false])

    const result = await promptForInstall({
      output: stream,
      daemonPath: '/path/to/daemon',
    })

    expect(result).toBe(false)
  })

  it('should return false when prompt is cancelled (default is no)', async () => {
    const { stream } = createOutputCollector()
    prompts.inject([undefined])

    const result = await promptForInstall({
      output: stream,
      daemonPath: '/path/to/daemon',
    })

    expect(result).toBe(false)
  })

  it('should display daemon path in output', async () => {
    const { stream, getOutput } = createOutputCollector()
    prompts.inject([false])

    await promptForInstall({
      output: stream,
      daemonPath: '/custom/daemon/path',
    })

    expect(getOutput()).toContain('/custom/daemon/path')
    expect(getOutput()).toContain('Daemon not found')
  })
})
