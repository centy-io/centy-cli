import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockHandleGlobalList = vi.fn()
const mockHandleProjectList = vi.fn()
const mockResolveProjectPath = vi.fn()

vi.mock('../lib/list-items/handle-global-list.js', () => ({
  handleGlobalList: (...args: unknown[]) => mockHandleGlobalList(...args),
}))

vi.mock('../lib/list-items/handle-project-list.js', () => ({
  handleProjectList: (...args: unknown[]) => mockHandleProjectList(...args),
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

describe('List command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockHandleProjectList.mockResolvedValue(undefined)
    mockHandleGlobalList.mockResolvedValue(undefined)
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./list.js')
    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./list.js')
    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  describe('single-project listing', () => {
    it('should delegate to handleProjectList', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectList).toHaveBeenCalledWith(
        '/test/project',
        'issues',
        '',
        0,
        0,
        undefined,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pass status filter', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { status: 'open' },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectList).toHaveBeenCalledWith(
        '/test/project',
        'issues',
        JSON.stringify({ status: { $eq: 'open' } }),
        0,
        0,
        undefined,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pass priority filter', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { priority: 1 },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectList).toHaveBeenCalledWith(
        '/test/project',
        'issues',
        JSON.stringify({ priority: { $eq: 1 } }),
        0,
        0,
        undefined,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pass limit and offset', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { limit: 10, offset: 20 },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectList).toHaveBeenCalledWith(
        '/test/project',
        'issues',
        '',
        10,
        20,
        undefined,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pass json flag', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { json: true },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleProjectList).toHaveBeenCalledWith(
        '/test/project',
        'issues',
        '',
        0,
        0,
        true,
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('global listing', () => {
    it('should delegate to handleGlobalList when --global is set', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { global: true },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleGlobalList).toHaveBeenCalledWith(
        'issues',
        '',
        0,
        0,
        undefined,
        expect.any(Function),
        expect.any(Function)
      )
      expect(mockHandleProjectList).not.toHaveBeenCalled()
      expect(mockResolveProjectPath).not.toHaveBeenCalled()
    })

    it('should pass filters to global list', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { global: true, status: 'open', limit: 5 },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleGlobalList).toHaveBeenCalledWith(
        'issues',
        JSON.stringify({ status: { $eq: 'open' } }),
        5,
        0,
        undefined,
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('should pass json flag to global list', async () => {
      const { default: Command } = await import('./list.js')

      const cmd = createMockCommand(Command, {
        flags: { global: true, json: true },
        args: { type: 'issue' },
      })

      await cmd.run()

      expect(mockHandleGlobalList).toHaveBeenCalledWith(
        'issues',
        '',
        0,
        0,
        true,
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('error handling', () => {
    it('should propagate errors from handleProjectList', async () => {
      const { default: Command } = await import('./list.js')
      mockHandleProjectList.mockRejectedValue(new Error('Failed'))

      const cmd = createMockCommand(Command, {
        flags: {},
        args: { type: 'issue' },
      })

      const { error } = await runCommandSafely(cmd)
      expect(error).toBeDefined()
    })
  })
})
