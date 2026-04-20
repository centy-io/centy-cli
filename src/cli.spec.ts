import { join } from 'node:path'
import { Writable } from 'node:stream'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { InitResponse } from './daemon/types.js'

vi.mock('./utils/is-git-repo.js', () => ({
  isGitRepo: () => true,
}))

const mockDaemonInit = vi.fn()

vi.mock('./daemon/daemon-init.js', () => ({
  daemonInit: (...args: unknown[]) => mockDaemonInit(...args),
}))

const { init } = await import('./lib/init/index.js')

function createOutputCapture(): { stream: Writable; getOutput: () => string } {
  let output = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString()
      callback()
    },
  })
  return { stream, getOutput: () => output }
}

function createMockResponse(
  overrides: Partial<InitResponse> = {}
): InitResponse {
  return {
    success: true,
    error: '',
    created: ['issues/', 'docs/', 'README.md'],
    restored: [],
    reset: [],
    skipped: [],
    ...overrides,
  }
}

describe('init command', () => {
  const tempDir = '/tmp/centy-test'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create .centy folder with force flag', async () => {
    mockDaemonInit.mockResolvedValue(createMockResponse())

    const { stream, getOutput } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(getOutput()).toContain('Successfully initialized')
  })

  it('should create README.md with correct content', async () => {
    mockDaemonInit.mockResolvedValue(createMockResponse())

    const { stream, getOutput } = createOutputCapture()
    await init({ force: true, cwd: tempDir, output: stream })

    expect(getOutput()).toContain('Created README.md')
  })

  it('should create manifest file', async () => {
    mockDaemonInit.mockResolvedValue(createMockResponse())

    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(mockDaemonInit).toHaveBeenCalled()
  })

  it('should detect existing folder and report', async () => {
    mockDaemonInit.mockResolvedValue(
      createMockResponse({
        created: [],
        skipped: ['issues/', 'docs/', 'README.md'],
      })
    )

    const { stream, getOutput } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(getOutput()).toContain('Initializing .centy folder')
  })

  it('should return created files in result', async () => {
    mockDaemonInit.mockResolvedValue(createMockResponse())

    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(result.created).toContain('issues/')
    expect(result.created).toContain('docs/')
    expect(result.created).toContain('README.md')
  })

  it('should set centyPath in result', async () => {
    mockDaemonInit.mockResolvedValue(createMockResponse())

    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.centyPath).toBe(join(tempDir, '.centy'))
  })
})
