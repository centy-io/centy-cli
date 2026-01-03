import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockReadFile = vi.fn()

vi.mock('node:fs/promises', () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
}))

describe('Llm command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./llm.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
    expect(Command.description).toContain('LLM')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./llm.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should output README content when .centy/README.md exists', async () => {
    const { default: Command } = await import('./llm.js')
    const readmeContent =
      '# Centy Project\n\nDO NOT edit .centy/ folder directly'
    mockReadFile.mockResolvedValue(readmeContent)

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes(readmeContent))).toBe(true)
  })

  it('should output JSON when json flag is set and project exists', async () => {
    const { default: Command } = await import('./llm.js')
    const readmeContent = '# Centy Project\n\nInstructions here'
    mockReadFile.mockResolvedValue(readmeContent)

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('"projectInitialized": true'))
    ).toBe(true)
    expect(cmd.logs.some(log => log.includes('"instructions"'))).toBe(true)
  })

  it('should display helpful message when no centy project found', async () => {
    const { default: Command } = await import('./llm.js')
    const error = new Error('ENOENT: no such file or directory')
    // @ts-expect-error - Adding code property for ENOENT error
    error.code = 'ENOENT'
    mockReadFile.mockRejectedValue(error)

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No centy project found'))).toBe(
      true
    )
    expect(cmd.logs.some(log => log.includes('centy init'))).toBe(true)
  })

  it('should output JSON with not initialized message when no project found', async () => {
    const { default: Command } = await import('./llm.js')
    const error = new Error('ENOENT: no such file or directory')
    // @ts-expect-error - Adding code property for ENOENT error
    error.code = 'ENOENT'
    mockReadFile.mockRejectedValue(error)

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: {},
    })

    await cmd.run()

    expect(
      cmd.logs.some(log => log.includes('"projectInitialized": false'))
    ).toBe(true)
  })

  it('should rethrow unexpected errors', async () => {
    const { default: Command } = await import('./llm.js')
    mockReadFile.mockRejectedValue(new Error('Permission denied'))

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: {},
    })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    if (error) {
      expect(error.message).toBe('Permission denied')
    }
  })
})
