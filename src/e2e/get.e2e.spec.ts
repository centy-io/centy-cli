/**
 * E2E tests for `centy get` command.
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

const MOCK_ISSUE = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  itemType: 'issues',
  title: 'E2E Test Issue',
  body: 'This is a test issue body.',
  metadata: {
    displayNumber: 1,
    status: 'open',
    priority: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    deletedAt: '',
    customFields: {},
  },
}

const MOCK_DOC = {
  id: 'getting-started',
  itemType: 'docs',
  title: 'Getting Started',
  body: '# Welcome\n\nThis is the getting started guide.',
  metadata: {
    displayNumber: 0,
    status: '',
    priority: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    deletedAt: '',
    customFields: {},
  },
}

const defaultHandlers: MockHandlers = {
  ...BASE_HANDLERS,
  isInitialized: () => ({
    initialized: true,
    centyPath: `${TEST_PROJECT_PATH}/.centy`,
  }),
  getItem: () => ({
    success: true,
    error: '',
    item: MOCK_ISSUE,
  }),
}

describe('get command (e2e)', () => {
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

  describe('getting an issue', () => {
    it('should display issue by display number', async () => {
      const result = await run(['get', 'issue', '1'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Issue #1')
      expect(result.stdout).toContain('E2E Test Issue')
      expect(result.stdout).toContain('open')
      expect(result.stdout).toContain('P1')
    })

    it('should display issue by UUID', async () => {
      const result = await run([
        'get',
        'issue',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      ])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('E2E Test Issue')
      expect(result.stdout).toContain('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    })

    it('should output JSON with --json flag', async () => {
      const result = await run(['get', 'issue', '1', '--json'])

      expect(result.exitCode).toBe(0)
      const parsed = JSON.parse(result.stdout)
      expect(parsed.id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      expect(parsed.title).toBe('E2E Test Issue')
      expect(parsed.itemType).toBe('issues')
    })

    it('should exit with error when issue not found', async () => {
      server.setHandler('getItem', () => ({
        success: false,
        error: 'Issue not found',
        item: undefined,
      }))

      const result = await run(['get', 'issue', '999'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('Issue not found')
    })
  })

  describe('getting a doc', () => {
    it('should display doc by slug', async () => {
      server.setHandler('getItem', () => ({
        success: true,
        error: '',
        item: MOCK_DOC,
      }))

      const result = await run(['get', 'doc', 'getting-started'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Getting Started')
      expect(result.stdout).toContain('getting-started')
    })

    it('should show doc content in output', async () => {
      server.setHandler('getItem', () => ({
        success: true,
        error: '',
        item: MOCK_DOC,
      }))

      const result = await run(['get', 'doc', 'getting-started'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Content')
    })

    it('should output doc as JSON with --json flag', async () => {
      server.setHandler('getItem', () => ({
        success: true,
        error: '',
        item: MOCK_DOC,
      }))

      const result = await run(['get', 'doc', 'getting-started', '--json'])

      expect(result.exitCode).toBe(0)
      const parsed = JSON.parse(result.stdout)
      expect(parsed.id).toBe('getting-started')
      expect(parsed.itemType).toBe('docs')
    })
  })

  describe('error handling', () => {
    it('should fail gracefully when project is not initialized', async () => {
      server.setHandler('isInitialized', () => ({
        initialized: false,
        centyPath: '',
      }))

      const result = await run(['get', 'issue', '1'])

      expect(result.exitCode).not.toBe(0)
      expect(result.stderr).toContain('.centy')
    })
  })
})
