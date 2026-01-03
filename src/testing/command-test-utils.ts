import { Command } from '@oclif/core'
import { vi } from 'vitest'

/**
 * Creates a mock command instance for testing
 * @param CommandClass The command class to instantiate
 * @param parseResult The mock result of `this.parse()`
 */
export function createMockCommand<
  T extends typeof Command,
  F extends Record<string, unknown> = Record<string, unknown>,
  A extends Record<string, unknown> = Record<string, unknown>,
>(
  CommandClass: T,
  parseResult: { flags?: F; args?: A }
): InstanceType<T> & {
  logs: string[]
  errors: string[]
  warnings: string[]
  exitCode: number | undefined
} {
  const cmd = new CommandClass([], {} as never) as InstanceType<T> & {
    logs: string[]
    errors: string[]
    warnings: string[]
    exitCode: number | undefined
  }

  // Store outputs
  cmd.logs = []
  cmd.errors = []
  cmd.warnings = []
  cmd.exitCode = undefined

  // Mock parse to return provided values
  cmd.parse = vi.fn().mockResolvedValue({
    flags: parseResult.flags ?? {},
    args: parseResult.args ?? {},
  })

  // Mock output methods to capture output
  cmd.log = vi.fn((...args: unknown[]) => {
    cmd.logs.push(args.map(String).join(' '))
  })

  cmd.warn = vi.fn((message: string) => {
    cmd.warnings.push(message)
  })

  // Mock error to capture and optionally throw
  cmd.error = vi.fn((message: string | Error) => {
    const errorMessage = message instanceof Error ? message.message : message
    cmd.errors.push(errorMessage)
    throw new Error(errorMessage)
  }) as never

  // Mock exit to capture exit code
  cmd.exit = vi.fn((code?: number) => {
    cmd.exitCode = code ?? 0
    throw new Error(`Exit called with code ${code ?? 0}`)
  }) as never

  return cmd
}

/**
 * Helper to run a command and catch expected errors
 */
export async function runCommandSafely(
  cmd: Command & { run: () => Promise<void> }
): Promise<{ error?: Error }> {
  try {
    await cmd.run()
    return {}
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }
}
