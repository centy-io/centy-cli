import { Command } from '@oclif/core'
import { describe, expect, it } from 'vitest'
import { createMockCommand, runCommandSafely } from './command-test-utils.js'

export class TestCommand extends Command {
  static override description = 'Test command'

  async run(): Promise<void> {
    const { flags } = await this.parse(TestCommand)
    this.log(`Flags: ${JSON.stringify(flags)}`)
  }
}

export class ErrorCommand extends Command {
  static override description = 'Error command'

  async run(): Promise<void> {
    throw new Error('Test error')
  }
}

describe('createMockCommand', () => {
  it('should create a mock command instance', () => {
    const cmd = createMockCommand(TestCommand, { flags: { verbose: true } })

    expect(cmd).toBeInstanceOf(TestCommand)
    expect(cmd.logs).toEqual([])
    expect(cmd.errors).toEqual([])
    expect(cmd.warnings).toEqual([])
    expect(cmd.exitCode).toBeUndefined()
  })

  it('should mock parse to return provided flags', async () => {
    const cmd = createMockCommand(TestCommand, { flags: { verbose: true } })

    const result = await cmd.parse(TestCommand)

    expect(result).toEqual({
      flags: { verbose: true },
      args: {},
    })
  })

  it('should mock parse to return provided args', async () => {
    const cmd = createMockCommand(TestCommand, {
      flags: {},
      args: { name: 'test' },
    })

    const result = await cmd.parse(TestCommand)

    expect(result).toEqual({
      flags: {},
      args: { name: 'test' },
    })
  })

  it('should capture log output', () => {
    const cmd = createMockCommand(TestCommand, {})

    cmd.log('Hello', 'World')

    expect(cmd.logs).toEqual(['Hello World'])
  })

  it('should capture warning output', () => {
    const cmd = createMockCommand(TestCommand, {})

    cmd.warn('This is a warning')

    expect(cmd.warnings).toEqual(['This is a warning'])
  })

  it('should capture error and throw', () => {
    const cmd = createMockCommand(TestCommand, {})

    expect(() => cmd.error('This is an error')).toThrow('This is an error')
    expect(cmd.errors).toEqual(['This is an error'])
  })

  it('should handle Error objects in error method', () => {
    const cmd = createMockCommand(TestCommand, {})

    expect(() => cmd.error(new Error('Error object'))).toThrow('Error object')
    expect(cmd.errors).toEqual(['Error object'])
  })

  it('should capture exit code and throw', () => {
    const cmd = createMockCommand(TestCommand, {})

    expect(() => cmd.exit(1)).toThrow('Exit called with code 1')
    expect(cmd.exitCode).toBe(1)
  })

  it('should default exit code to 0', () => {
    const cmd = createMockCommand(TestCommand, {})

    expect(() => cmd.exit()).toThrow('Exit called with code 0')
    expect(cmd.exitCode).toBe(0)
  })
})

describe('runCommandSafely', () => {
  it('should return empty object when command succeeds', async () => {
    const cmd = createMockCommand(TestCommand, { flags: {} })

    const result = await runCommandSafely(cmd)

    expect(result).toEqual({})
  })

  it('should catch and return errors', async () => {
    const cmd = createMockCommand(ErrorCommand, {})

    const result = await runCommandSafely(cmd)

    expect(result.error).toBeInstanceOf(Error)
    expect((result.error as Error).message).toBe('Test error')
  })

  it('should convert non-Error throws to Error', async () => {
    const cmd = createMockCommand(TestCommand, {})
    cmd.run = async () => {
      throw 'string error'
    }

    const result = await runCommandSafely(cmd)

    expect(result.error).toBeInstanceOf(Error)
    expect((result.error as Error).message).toBe('string error')
  })
})
