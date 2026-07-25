import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../testing/command-test-utils.js'

const mockHandleProjectNext = vi.fn()
const mockHandleGlobalNext = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../lib/next-item/handle-project-next.js', () => ({
  handleProjectNext: (...args: unknown[]) => mockHandleProjectNext(...args),
}))

vi.mock('../lib/next-item/handle-global-next.js', () => ({
  handleGlobalNext: (...args: unknown[]) => mockHandleGlobalNext(...args),
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

describe('Next command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockHandleProjectNext.mockResolvedValue(undefined)
    mockHandleGlobalNext.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./next.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./next.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('project-scoped next (no --global)', () => {
    it('should call handleProjectNext with default open status', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { status: 'open', json: false },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectNext).toHaveBeenCalledWith(
        '/test/project',
        'issues',
        'issue',
        JSON.stringify({ status: { $eq: 'open' } }),
        'open',
        false,
        expect.any(Function),
        expect.any(Function)
      )
      expect(mockHandleGlobalNext).not.toHaveBeenCalled()
    })

    it('should pass provided --status to handleProjectNext', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { status: 'in-progress', json: false },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectNext).toHaveBeenCalledWith(
        expect.any(String),
        'issues',
        'issue',
        JSON.stringify({ status: { $eq: 'in-progress' } }),
        'in-progress',
        false,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pluralize type for handleProjectNext', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { status: 'open', json: false },
        args: { type: 'bug' },
      })

      await cmd.run()

      expect(mockHandleProjectNext).toHaveBeenCalledWith(
        expect.any(String),
        'bugs',
        'bug',
        expect.any(String),
        expect.any(String),
        false,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pass json flag to handleProjectNext', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { json: true, status: 'open' },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectNext).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        true,
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('--global flag', () => {
    it('should call handleGlobalNext with correct args', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { global: true, json: false, status: 'open' },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleGlobalNext).toHaveBeenCalledWith(
        'issues',
        'issue',
        JSON.stringify({ status: { $eq: 'open' } }),
        'open',
        false,
        expect.any(Function)
      )
      expect(mockHandleProjectNext).not.toHaveBeenCalled()
      expect(mockResolveProjectPath).not.toHaveBeenCalled()
    })

    it('should pass --status to handleGlobalNext', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { global: true, status: 'in-progress', json: false },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleGlobalNext).toHaveBeenCalledWith(
        'issues',
        'issue',
        JSON.stringify({ status: { $eq: 'in-progress' } }),
        'in-progress',
        false,
        expect.any(Function)
      )
    })

    it('should pass json flag to handleGlobalNext', async () => {
      const { default: Command } = await import('./next.js')

      const cmd = createMockCommand(Command, {
        flags: { global: true, json: true },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleGlobalNext).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        true,
        expect.any(Function)
      )
    })
  })
})
