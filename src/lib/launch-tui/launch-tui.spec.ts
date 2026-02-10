import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockFindTuiBinary = vi.fn()
const mockTuiBinaryExists = vi.fn()
const mockSpawn = vi.fn()

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args),
}))

vi.mock('./find-tui-binary.js', () => ({
  findTuiBinary: () => mockFindTuiBinary(),
}))

vi.mock('./tui-binary-exists.js', () => ({
  tuiBinaryExists: (path: string) => mockTuiBinaryExists(path),
}))

vi.mock('../../utils/get-missing-binary-msg.js', () => ({
  getMissingBinaryMsg: (path: string, name: string, envVar: string) =>
    `${name} not found at ${path} (set ${envVar})`,
}))

vi.mock('../../utils/get-permission-denied-msg.js', () => ({
  getPermissionDeniedMsg: (path: string) => `Permission denied: ${path}`,
}))

function createMockChildProcess() {
  const errorHandler: { fn: ((...args: unknown[]) => void) | null } = {
    fn: null,
  }
  const spawnHandler: { fn: ((...args: unknown[]) => void) | null } = {
    fn: null,
  }
  return {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (event === 'error') {
        errorHandler.fn = handler
      }
      if (event === 'spawn') {
        spawnHandler.fn = handler
      }
    }),
    unref: vi.fn(),
    emitError(...args: unknown[]) {
      if (errorHandler.fn) errorHandler.fn(...args)
    },
    emitSpawn() {
      if (spawnHandler.fn) spawnHandler.fn()
    },
  }
}

function flushMicrotasks(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

function createErrnoException(message: string, code: string) {
  const error = new Error(message)
  // eslint-disable-next-line no-restricted-syntax
  ;(error as NodeJS.ErrnoException).code = code
  return error
}

describe('launchTui', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error when binary does not exist', async () => {
    mockFindTuiBinary.mockResolvedValue('/usr/local/bin/centy-tui')
    mockTuiBinaryExists.mockReturnValue(false)

    const { launchTui } = await import('./launch-tui.js')
    const result = await launchTui()

    expect(result.success).toBe(false)
    expect(result.error).toContain('centy-tui not found')
  })

  it('should return success when binary spawns successfully', async () => {
    mockFindTuiBinary.mockResolvedValue('/usr/local/bin/centy-tui')
    mockTuiBinaryExists.mockReturnValue(true)
    const child = createMockChildProcess()
    mockSpawn.mockReturnValue(child)

    const { launchTui } = await import('./launch-tui.js')
    const promise = launchTui()

    await flushMicrotasks()
    child.emitSpawn()
    const result = await promise

    expect(result.success).toBe(true)
    expect(child.unref).toHaveBeenCalled()
  })

  it('should handle ENOENT error', async () => {
    mockFindTuiBinary.mockResolvedValue('/usr/local/bin/centy-tui')
    mockTuiBinaryExists.mockReturnValue(true)
    const child = createMockChildProcess()
    mockSpawn.mockReturnValue(child)

    const { launchTui } = await import('./launch-tui.js')
    const promise = launchTui()

    await flushMicrotasks()
    child.emitError(createErrnoException('spawn failed', 'ENOENT'))
    const result = await promise

    expect(result.success).toBe(false)
    expect(result.error).toContain('centy-tui not found')
  })

  it('should handle EACCES error', async () => {
    mockFindTuiBinary.mockResolvedValue('/usr/local/bin/centy-tui')
    mockTuiBinaryExists.mockReturnValue(true)
    const child = createMockChildProcess()
    mockSpawn.mockReturnValue(child)

    const { launchTui } = await import('./launch-tui.js')
    const promise = launchTui()

    await flushMicrotasks()
    child.emitError(createErrnoException('permission denied', 'EACCES'))
    const result = await promise

    expect(result.success).toBe(false)
    expect(result.error).toContain('Permission denied')
  })

  it('should reject on unknown error', async () => {
    mockFindTuiBinary.mockResolvedValue('/usr/local/bin/centy-tui')
    mockTuiBinaryExists.mockReturnValue(true)
    const child = createMockChildProcess()
    mockSpawn.mockReturnValue(child)

    const { launchTui } = await import('./launch-tui.js')
    const promise = launchTui()

    await flushMicrotasks()
    child.emitError(createErrnoException('unknown error', 'UNKNOWN'))

    await expect(promise).rejects.toThrow('unknown error')
  })
})
