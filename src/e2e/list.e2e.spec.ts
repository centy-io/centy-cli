/**
 * E2E tests for `centy list` command.
 * Runs the compiled CLI binary against a mock gRPC server.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  MockGrpcServer,
  type MockHandlers,
} from '../testing/mock-grpc-server.js'
import { runCli } from '../testing/e2e-run-cli.js'
import { BASE_HANDLERS } from '../testing/e2e-default-handlers.js'

const TEST_PROJECT_PATH = '/test/project'

const MOCK_ITEMS = [
  {
    id: 'issue-uuid-0001',
    itemType: 'issues',
    title: 'First Issue',
    body: '',
    metadata: {
      displayNumber: 1,
      status: 'open',
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
  },
  {
    id: 'issue-uuid-0002',
    itemType: 'issues',
    title: 'Second Issue',
    body: '',
    metadata: {
      displayNumber: 2,
      status: 'closed',
      priority: 2,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
  },
  {
    id: 'issue-uuid-0003',
    itemType: 'issues',
    title: 'Third Issue',
    body: '',
    metadata: {
      displayNumber: 3,
      status: 'open',
      priority: 0,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      deletedAt: '',
      customFields: {},
    },
  },
]

const defaultHandlers: MockHandlers = {
  ...BASE_HANDLERS,
  isInitialized: () => ({
    initialized: true,
    centyPath: `${TEST_PROJECT_PATH}/.centy`,
  }),
  listItems: () => ({
    success: true,
    error: '',
    items: MOCK_ITEMS,
    totalCount: 3,
  }),
}

describe('list command (e2e)', () => {
  let server: MockGrpcServer
  let daemonAddr: string

  beforeAll(async () => {
    server = new MockGrpcServer(defaultHandlers)
    daemonAddr = await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    server.setHandlers(defaultHandlers)
  })

  const run = (args: string[]) =>
    runCli(args, { daemonAddr, projectCwd: TEST_PROJECT_PATH })

  describe('listing issues', () => {
    it('should list all issues and show count', async () => {
      const result = await run(['list', 'issue'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('3')
    })

    it('should include issue titles in output', async () => {
      const result = await run(['list', 'issue'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('First Issue')
      expect(result.stdout).toContain('Second Issue')
      expect(result.stdout).toContain('Third Issue')
    })

    it('should include display numbers in output', async () => {
      const result = await run(['list', 'issue'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('#1')
      expect(result.stdout).toContain('#2')
      expect(result.stdout).toContain('#3')
    })

    it('should output JSON array with --json flag', async () => {
      const result = await run(['list', 'issue', '--json'])

      expect(result.exitCode).toBe(0)
      const parsed = JSON.parse(result.stdout)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(3)
      expect(parsed[0].title).toBe('First Issue')
    })
  })

  describe('filtering', () => {
    it('should pass status filter to daemon', async () => {
      let capturedRequest: Record<string, unknown> = {}
      server.setHandler('listItems', (req: unknown) => {
        capturedRequest = req as Record<string, unknown>
        return {
          success: true,
          error: '',
          items: MOCK_ITEMS.filter(
            i => i.metadata.status === 'open'
          ),
          totalCount: 2,
        }
      })

      const result = await run(['list', 'issue', '--status', 'open'])

      expect(result.exitCode).toBe(0)
      expect(capturedRequest['status']).toBe('open')
    })
  })

  describe('empty results', () => {
    it('should handle empty list gracefully', async () => {
      server.setHandler('listItems', () => ({
        success: true,
        error: '',
        items: [],
        totalCount: 0,
      }))

      const result = await run(['list', 'issue'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No issues found')
    })
  })

  describe('error handling', () => {
    it('should display error when listing fails', async () => {
      server.setHandler('listItems', () => ({
        success: false,
        error: 'Database error',
        items: [],
        totalCount: 0,
      }))

      const result = await run(['list', 'issue'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('Database error')
    })

    it('should fail when project is not initialized', async () => {
      server.setHandler('isInitialized', () => ({
        initialized: false,
        centyPath: '',
      }))

      const result = await run(['list', 'issue'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('.centy')
    })
  })
})
