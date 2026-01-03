/* eslint-disable ddd/require-spec-file -- Integration test */
import { join } from 'node:path'
import { Writable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReconciliationPlan, InitResponse } from '../../daemon/types.js'

// Mock daemon client
const mockGetReconciliationPlan = vi.fn()
const mockExecuteReconciliation = vi.fn()

vi.mock('../../daemon/daemon-get-reconciliation-plan.js', () => ({
  daemonGetReconciliationPlan: (...args: unknown[]) =>
    mockGetReconciliationPlan(...args),
}))

vi.mock('../../daemon/daemon-execute-reconciliation.js', () => ({
  daemonExecuteReconciliation: (...args: unknown[]) =>
    mockExecuteReconciliation(...args),
}))

// Import after mocking
const { init } = await import('./init.js')

// Helper to create a writable stream that collects output
function createOutputCollector(): {
  stream: Writable
  getOutput: () => string
} {
  let output = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString()
      callback()
    },
  })
  return {
    stream,
    getOutput: () => output,
  }
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

describe('init integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fresh initialization', () => {
    it('should create .centy folder structure via daemon', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(result.centyPath).toBe(join('/project', '.centy'))
      expect(mockGetReconciliationPlan).toHaveBeenCalledWith({
        projectPath: '/project',
      })
    })

    it('should return created files in result', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.created).toContain('issues/')
      expect(result.created).toContain('docs/')
      expect(result.created).toContain('README.md')
    })

    it('should output connection message', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Connected to centy daemon')
    })

    it('should output initialization message', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Initializing .centy folder')
    })
  })

  describe('existing folder reconciliation', () => {
    it('should preserve user-created files', async () => {
      mockGetReconciliationPlan.mockResolvedValue(
        createMockPlan({
          toCreate: [],
          upToDate: ['issues/', 'docs/', 'README.md'],
          userFiles: [{ path: 'issues/0001-my-issue.md', hash: 'abc123' }],
        })
      )
      mockExecuteReconciliation.mockResolvedValue(
        createMockResponse({
          created: [],
        })
      )

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.userFiles).toContain('issues/0001-my-issue.md')
    })

    it('should report restored files', async () => {
      mockGetReconciliationPlan.mockResolvedValue(
        createMockPlan({
          toCreate: [],
          toRestore: [{ path: 'README.md', hash: 'abc123' }],
        })
      )
      mockExecuteReconciliation.mockResolvedValue(
        createMockResponse({
          created: [],
          restored: ['README.md'],
        })
      )

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.restored).toContain('README.md')
    })

    it('should report reset files when force is true', async () => {
      mockGetReconciliationPlan.mockResolvedValue(
        createMockPlan({
          toCreate: [],
          toReset: [{ path: 'README.md', hash: 'modified123' }],
        })
      )
      mockExecuteReconciliation.mockResolvedValue(
        createMockResponse({
          created: [],
          reset: [],
          skipped: [],
        })
      )

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      // When forced with toReset files, they should be skipped (force skips reset)
      expect(result.skipped).toContain('README.md')
    })
  })

  describe('daemon unavailable', () => {
    it('should show error when daemon is not running (ECONNREFUSED)', async () => {
      mockGetReconciliationPlan.mockRejectedValue(new Error('ECONNREFUSED'))

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      const output = collector.getOutput()
      expect(output).toContain('Centy daemon is not running')
    })

    it('should show error when daemon is unavailable', async () => {
      mockGetReconciliationPlan.mockRejectedValue(new Error('UNAVAILABLE'))

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      const output = collector.getOutput()
      expect(output).toContain('Centy daemon is not running')
    })

    it('should report other errors normally', async () => {
      mockGetReconciliationPlan.mockRejectedValue(new Error('Some other error'))

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      const output = collector.getOutput()
      expect(output).toContain('Error: Some other error')
    })
  })

  describe('daemon execution errors', () => {
    it('should handle daemon execution failure', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(
        createMockResponse({
          success: false,
          error: 'Failed to write files',
        })
      )

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      const output = collector.getOutput()
      expect(output).toContain('Error: Failed to write files')
    })
  })

  describe('output messages', () => {
    it('should output success message on completion', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Successfully initialized')
    })

    it('should list created files in output', async () => {
      mockGetReconciliationPlan.mockResolvedValue(createMockPlan())
      mockExecuteReconciliation.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Created issues/')
      expect(output).toContain('Created docs/')
      expect(output).toContain('Created README.md')
    })
  })
})
