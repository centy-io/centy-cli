import { describe, expect, it } from 'vitest'
import { runCli } from './e2e-run-cli.js'

describe('runCli', () => {
  it('should return an object with stdout, stderr, and exitCode', async () => {
    const result = await runCli(['--version'], {
      daemonAddr: '127.0.0.1:0',
      timeout: 5000,
    })

    expect(typeof result.stdout).toBe('string')
    expect(typeof result.stderr).toBe('string')
    expect(typeof result.exitCode).toBe('number')
  })

  it('should return a non-zero exit code for invalid commands', async () => {
    const result = await runCli(['__nonexistent_command__'], {
      daemonAddr: '127.0.0.1:0',
      timeout: 5000,
    })

    expect(result.exitCode).not.toBe(0)
  })
})
