/**
 * E2E tests for `centy create` command.
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

const defaultHandlers: MockHandlers = {
  ...BASE_HANDLERS,
  isInitialized: () => ({
    initialized: true,
    centyPath: `${TEST_PROJECT_PATH}/.centy`,
  }),
  createItem: () => ({
    success: true,
    error: '',
    item: {
      id: 'new-uuid-1234-5678-9012',
      itemType: 'issues',
      title: 'New Issue',
      body: '',
      metadata: {
        displayNumber: 42,
        status: 'open',
        priority: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: '',
        customFields: {},
      },
    },
  }),
}

describe('create command (e2e)', () => {
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

  describe('creating an issue', () => {
    it('should create issue and display success message', async () => {
      const result = await run(['create', 'issue', '--title', 'New Issue'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Created issue')
      expect(result.stdout).toContain('#42')
    })

    it('should create issue with body flag', async () => {
      let capturedRequest: Record<string, unknown> = {}
      server.setHandler('createItem', (req: Record<string, unknown>) => {
        capturedRequest = req
        return defaultHandlers['createItem']!(req)
      })

      await run(['create', 'issue', '--title', 'Test', '--body', 'Issue body'])

      expect(capturedRequest['body']).toBe('Issue body')
    })

    it('should create issue with priority flag', async () => {
      let capturedRequest: Record<string, unknown> = {}
      server.setHandler('createItem', (req: Record<string, unknown>) => {
        capturedRequest = req
        return defaultHandlers['createItem']!(req)
      })

      await run(['create', 'issue', '--title', 'Urgent', '--priority', '1'])

      expect(capturedRequest['priority']).toBe(1)
    })

    it('should create issue with status flag', async () => {
      let capturedRequest: Record<string, unknown> = {}
      server.setHandler('createItem', (req: Record<string, unknown>) => {
        capturedRequest = req
        return defaultHandlers['createItem']!(req)
      })

      await run([
        'create',
        'issue',
        '--title',
        'Test',
        '--status',
        'in-progress',
      ])

      expect(capturedRequest['status']).toBe('in-progress')
    })
  })

  describe('creating a doc', () => {
    it('should create doc and display success message', async () => {
      server.setHandler('createItem', () => ({
        success: true,
        error: '',
        item: {
          id: 'getting-started',
          itemType: 'docs',
          title: 'Getting Started',
          body: '# Hello',
          metadata: {
            displayNumber: 0,
            status: '',
            priority: 0,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            deletedAt: '',
            customFields: {},
          },
        },
      }))

      const result = await run(['create', 'doc', '--title', 'Getting Started'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Created doc')
    })
  })

  describe('error handling', () => {
    it('should display error when creation fails', async () => {
      server.setHandler('createItem', () => ({
        success: false,
        error: 'Unknown item type',
        item: undefined,
      }))

      const result = await run(['create', 'issue', '--title', 'Test'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('Unknown item type')
    })

    it('should fail when project is not initialized', async () => {
      server.setHandler('isInitialized', () => ({
        initialized: false,
        centyPath: '',
      }))

      const result = await run(['create', 'issue', '--title', 'Test'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('.centy')
    })
  })
})
