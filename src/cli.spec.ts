/* eslint-disable ddd/require-spec-file -- Integration test for init functionality */
import { join } from 'node:path'
import { Writable } from 'node:stream'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ReconciliationPlan, InitResponse } from './daemon/types.js'

// Mock daemon client
const mockGetReconciliationPlan = vi.fn()
const mockExecuteReconciliation = vi.fn()

vi.mock('./daemon/daemon-get-reconciliation-plan.js', () => ({
  daemonGetReconciliationPlan: (...args: unknown[]) =>
    mockGetReconciliationPlan(...args),
}))

vi.mock('./daemon/daemon-execute-reconciliation.js', () => ({
  daemonExecuteReconciliation: (...args: unknown[]) =>
    mockExecuteReconciliation(...args),
}))

const { init } = await import('./lib/init/index.js')

/**
 * Create a writable stream that captures output to a string
 */
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

// Helper to create mock reconciliation plan
function createMockPlan(
  overrides: Partial<ReconciliationPlan> = {}
): ReconciliationPlan {
  return {
    toCreate: ['issues/', 'docs/', 'README.md'],
    toRestore: [],
    toReset: [],
    upToDate: [],
    userFiles: [],
    ...overrides,
  }
}

// Helper to create mock init response
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
    mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
    mockExecuteReconciliation.mockResolvedValue(createMockResponse())

    const { stream, getOutput } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(getOutput()).toContain('Connected to centy daemon')
    expect(getOutput()).toContain('Successfully initialized')
  })

  it('should create README.md with correct content', async () => {
    mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
    mockExecuteReconciliation.mockResolvedValue(createMockResponse())

    const { stream, getOutput } = createOutputCapture()
    await init({ force: true, cwd: tempDir, output: stream })

    expect(getOutput()).toContain('Created README.md')
  })

  it('should create manifest file', async () => {
    mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
    mockExecuteReconciliation.mockResolvedValue(createMockResponse())

    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(mockExecuteReconciliation).toHaveBeenCalled()
  })

  it('should detect existing folder and report', async () => {
    mockGetReconciliationPlan.mockResolvedValue(
      createMockPlan({
        toCreate: [],
        upToDate: ['issues/', 'docs/', 'README.md'],
      })
    )
    mockExecuteReconciliation.mockResolvedValue(
      createMockResponse({
        created: [],
      })
    )

    const { stream, getOutput } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(getOutput()).toContain('Connected to centy daemon')
  })

  it('should return created files in result', async () => {
    mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
    mockExecuteReconciliation.mockResolvedValue(createMockResponse())

    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(result.created).toContain('issues/')
    expect(result.created).toContain('docs/')
    expect(result.created).toContain('README.md')
  })

  it('should set centyPath in result', async () => {
    mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
    mockExecuteReconciliation.mockResolvedValue(createMockResponse())

    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.centyPath).toBe(join(tempDir, '.centy'))
  })
})
