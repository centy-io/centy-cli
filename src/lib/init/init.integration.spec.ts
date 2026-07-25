import { join } from 'node:path'
import { Writable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InitResponse } from '../../daemon/types.js'

const mockDaemonInit = vi.fn()
const mockIsGitRepo = vi.fn().mockReturnValue(true)

vi.mock('../../daemon/daemon-init.js', () => ({
  daemonInit: (...args: unknown[]) => mockDaemonInit(...args),
}))

vi.mock('../../utils/is-git-repo.js', () => ({
  isGitRepo: (cwd: unknown) => mockIsGitRepo(cwd),
}))

// Import after mocking
const { init } = await import('./init.js')

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
      mockDaemonInit.mockResolvedValue(createMockResponse())

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(result.centyPath).toBe(join('/project', '.centy'))
      expect(mockDaemonInit).toHaveBeenCalledWith(
        expect.objectContaining({ projectPath: '/project', force: true })
      )
    })

    it('should return created files in result', async () => {
      mockDaemonInit.mockResolvedValue(createMockResponse())

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

    it('should output initialization message', async () => {
      mockDaemonInit.mockResolvedValue(createMockResponse())

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
    it('should report restored files', async () => {
      mockDaemonInit.mockResolvedValue(
        createMockResponse({ created: [], restored: ['README.md'] })
      )

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.restored).toContain('README.md')
    })

    it('should report reset files', async () => {
      mockDaemonInit.mockResolvedValue(
        createMockResponse({ created: [], reset: ['README.md'] })
      )

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.reset).toContain('README.md')
    })
  })

  describe('daemon unavailable', () => {
    it('should show error when daemon is not running (ECONNREFUSED)', async () => {
      mockDaemonInit.mockRejectedValue(new Error('ECONNREFUSED'))

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
      mockDaemonInit.mockRejectedValue(new Error('UNAVAILABLE'))

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
      mockDaemonInit.mockRejectedValue(new Error('Some other error'))

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
      mockDaemonInit.mockResolvedValue(
        createMockResponse({ success: false, error: 'Failed to write files' })
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
      mockDaemonInit.mockResolvedValue(createMockResponse())

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
      mockDaemonInit.mockResolvedValue(createMockResponse())

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
