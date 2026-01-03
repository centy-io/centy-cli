/* eslint-disable ddd/require-spec-file -- Integration test */
import { join } from 'node:path'
import { Writable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  CreateIssueResponse,
  IsInitializedResponse,
} from '../../daemon/types.js'

// Mock daemon clients
const mockDaemonIsInitialized = vi.fn()
const mockDaemonCreateIssue = vi.fn()

vi.mock('../../daemon/daemon-is-initialized.js', () => ({
  daemonIsInitialized: (...args: unknown[]) => mockDaemonIsInitialized(...args),
}))

vi.mock('../../daemon/daemon-create-issue.js', () => ({
  daemonCreateIssue: (...args: unknown[]) => mockDaemonCreateIssue(...args),
}))

// Import after mocking
const { createIssue } = await import('./create-issue.js')

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

// Helper to create mock initialized response
function createInitializedResponse(
  overrides: Partial<IsInitializedResponse> = {}
): IsInitializedResponse {
  return {
    initialized: true,
    centyPath: join('/project', '.centy'),
    ...overrides,
  }
}

// Helper to create mock create issue response
function createMockIssueResponse(
  overrides: Partial<CreateIssueResponse> = {}
): CreateIssueResponse {
  return {
    success: true,
    error: '',
    issueNumber: '0001',
    createdFiles: [
      'issues/0001/issue.md',
      'issues/0001/metadata.json',
      'issues/0001/assets/',
    ],
    ...overrides,
  }
}

describe('createIssue integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic issue creation', () => {
    it('should create issue with title and description', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(createMockIssueResponse())

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'Test Issue',
        description: 'This is a test',
        priority: 'medium',
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(result.issueNumber).toBe('0001')
      expect(mockDaemonCreateIssue).toHaveBeenCalledWith({
        projectPath: '/project',
        title: 'Test Issue',
        description: 'This is a test',
        priority: 2, // medium = 2
        status: 'open',
        customFields: {},
        draft: false,
      })
    })

    it('should pass priority and status to daemon', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(createMockIssueResponse())

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'High Priority Issue',
        description: '',
        priority: 'high',
        status: 'in-progress',
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(mockDaemonCreateIssue).toHaveBeenCalledWith({
        projectPath: '/project',
        title: 'High Priority Issue',
        description: '',
        priority: 1, // high = 1
        status: 'in-progress',
        customFields: {},
        draft: false,
      })
    })

    it('should use medium priority when specified', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(createMockIssueResponse())

      const collector = createOutputCollector()
      await createIssue({
        cwd: '/project',
        title: 'Default values issue',
        description: '',
        priority: 'medium',
        output: collector.stream,
      })

      expect(mockDaemonCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 2, // medium = 2
          status: 'open',
        })
      )
    })
  })

  describe('issue numbering', () => {
    it('should return issue number from daemon response', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(
        createMockIssueResponse({ issueNumber: '0042' })
      )

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'Test',
        description: '',
        priority: 'medium',
        output: collector.stream,
      })

      expect(result.issueNumber).toBe('0042')
    })
  })

  describe('error handling', () => {
    it('should fail if .centy not initialized', async () => {
      mockDaemonIsInitialized.mockResolvedValue(
        createInitializedResponse({ initialized: false })
      )

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/empty-project',
        title: 'Test',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not initialized')
      expect(mockDaemonCreateIssue).not.toHaveBeenCalled()
    })

    it('should fail without title', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: '',
        description: '',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('title is required')
      expect(mockDaemonCreateIssue).not.toHaveBeenCalled()
    })

    it('should handle daemon create issue failure', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(
        createMockIssueResponse({
          success: false,
          error: 'Failed to create issue',
        })
      )

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'Test',
        description: '',
        priority: 'medium',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create issue')
    })

    it('should handle daemon unavailable', async () => {
      mockDaemonIsInitialized.mockRejectedValue(new Error('ECONNREFUSED'))

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'Test',
        description: '',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('daemon is not running')
    })

    it('should handle other daemon errors', async () => {
      mockDaemonIsInitialized.mockRejectedValue(new Error('Some other error'))

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'Test',
        description: '',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Some other error')
    })
  })

  describe('custom fields', () => {
    it('should pass custom fields to daemon', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(createMockIssueResponse())

      const collector = createOutputCollector()
      await createIssue({
        cwd: '/project',
        title: 'Custom Fields Test',
        description: '',
        priority: 'medium',
        customFields: {
          assignee: 'john',
          sprint: 5,
        },
        output: collector.stream,
      })

      expect(mockDaemonCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          customFields: {
            assignee: 'john',
            sprint: '5',
          },
        })
      )
    })
  })

  describe('output messages', () => {
    it('should output success message with paths', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(createMockIssueResponse())

      const collector = createOutputCollector()
      await createIssue({
        cwd: '/project',
        title: 'Output Test',
        description: '',
        priority: 'medium',
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Created issue #0001')
      expect(output).toContain('issue.md')
      expect(output).toContain('metadata.json')
    })
  })

  describe('result paths', () => {
    it('should return correct file paths based on issue number', async () => {
      mockDaemonIsInitialized.mockResolvedValue(createInitializedResponse())
      mockDaemonCreateIssue.mockResolvedValue(
        createMockIssueResponse({ issueNumber: '0005' })
      )

      const collector = createOutputCollector()
      const result = await createIssue({
        cwd: '/project',
        title: 'Path Test',
        description: '',
        priority: 'medium',
        output: collector.stream,
      })

      expect(result.issuePath).toBe(
        join('/project', '.centy', 'issues', '0005')
      )
      expect(result.issueMarkdownPath).toBe(
        join('/project', '.centy', 'issues', '0005', 'issue.md')
      )
      expect(result.metadataPath).toBe(
        join('/project', '.centy', 'issues', '0005', 'metadata.json')
      )
    })
  })
})
