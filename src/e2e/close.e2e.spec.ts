/**
 * E2E tests for `centy close` command.
 * Runs the compiled CLI binary against a mock gRPC server.
 * The close command resolves the item ID (via getItem) then calls updateItem.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  MockGrpcServer,
  type MockHandlers,
} from '../testing/mock-grpc-server.js'
import { runCli } from '../testing/e2e-run-cli.js'
import { BASE_HANDLERS } from '../testing/e2e-default-handlers.js'

const TEST_PROJECT_PATH = '/test/project'

const MOCK_OPEN_ISSUE = {
  id: 'issue-uuid-0001',
  itemType: 'issues',
  title: 'Issue to Close',
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
}

const MOCK_CLOSED_ISSUE = {
  ...MOCK_OPEN_ISSUE,
  metadata: {
    ...MOCK_OPEN_ISSUE.metadata,
    status: 'closed',
    updatedAt: '2024-01-02T00:00:00Z',
  },
}

const defaultHandlers: MockHandlers = {
  ...BASE_HANDLERS,
  isInitialized: () => ({
    initialized: true,
    centyPath: `${TEST_PROJECT_PATH}/.centy`,
  }),
  // getItem is called by resolveItemId when a display number is given
  getItem: () => ({
    success: true,
    error: '',
    item: MOCK_OPEN_ISSUE,
  }),
  updateItem: () => ({
    success: true,
    error: '',
    item: MOCK_CLOSED_ISSUE,
  }),
}

describe('close command (e2e)', () => {
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

  describe('closing by display number', () => {
    it('should close issue and display success message', async () => {
      const result = await run(['close', 'issue', '1'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Closed issue')
      expect(result.stdout).toContain('#1')
    })

    it('should call updateItem with status=closed', async () => {
      let capturedUpdateRequest: Record<string, unknown> = {}
      server.setHandler('updateItem', (req: Record<string, unknown>) => {
        capturedUpdateRequest = req
        return defaultHandlers['updateItem']!(req)
      })

      await run(['close', 'issue', '1'])

      expect(capturedUpdateRequest['status']).toBe('closed')
      expect(capturedUpdateRequest['itemId']).toBe('issue-uuid-0001')
    })
  })

  describe('closing by UUID', () => {
    it('should close issue by UUID directly', async () => {
      const result = await run(['close', 'issue', 'issue-uuid-0001'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Closed issue')
    })
  })

  describe('--json output', () => {
    it('should output JSON when --json flag is set', async () => {
      const result = await run(['close', 'issue', '1', '--json'])

      expect(result.exitCode).toBe(0)
      const parsed = JSON.parse(result.stdout)
      expect(parsed.status).toBe('closed')
      expect(parsed.type).toBe('issue')
    })
  })

  describe('error handling', () => {
    it('should fail when issue is not found during ID resolution', async () => {
      server.setHandler('getItem', () => ({
        success: false,
        error: 'Issue not found',
        item: undefined,
      }))

      const result = await run(['close', 'issue', '999'])

      expect(result.exitCode).not.toBe(0)
    })

    it('should fail when updateItem returns an error', async () => {
      server.setHandler('updateItem', () => ({
        success: false,
        error: 'Cannot close a deleted issue',
        item: undefined,
      }))

      const result = await run(['close', 'issue', '1'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('Cannot close a deleted issue')
    })

    it('should fail when project is not initialized', async () => {
      server.setHandler('isInitialized', () => ({
        initialized: false,
        centyPath: '',
      }))

      const result = await run(['close', 'issue', '1'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('.centy')
    })
  })
})
