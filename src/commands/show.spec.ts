import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockDaemonGetIssuesByUuid = vi.fn()
const mockIsValidUuid = vi.fn()

vi.mock('../daemon/daemon-get-issues-by-uuid.js', () => ({
  daemonGetIssuesByUuid: (...args: unknown[]) =>
    mockDaemonGetIssuesByUuid(...args),
}))

vi.mock('../utils/is-valid-uuid.js', () => ({
  isValidUuid: (...args: unknown[]) => mockIsValidUuid(...args),
}))

function createMockIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    displayNumber: 1,
    title: 'Test Issue',
    description: 'Test description',
    metadata: {
      status: 'open',
      priority: 1,
      priorityLabel: 'P1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    ...overrides,
  }
}

const emptyIssuesResult = { issues: [], totalCount: 0, errors: [] }

describe('Show command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsValidUuid.mockReturnValue(true)
    mockDaemonGetIssuesByUuid.mockResolvedValue(emptyIssuesResult)
  })

  it('should error on invalid UUID', async () => {
    const { default: Command } = await import('./show.js')
    mockIsValidUuid.mockReturnValue(false)

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { uuid: 'not-a-uuid' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors.some(e => e.includes('valid UUID'))).toBe(true)
  })

  it('should display single issue match', async () => {
    const { default: Command } = await import('./show.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [
        {
          issue: createMockIssue(),
          projectName: 'project-a',
          projectPath: '/path/to/project-a',
        },
      ],
      totalCount: 1,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(mockDaemonGetIssuesByUuid).toHaveBeenCalledWith({
      uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(cmd.logs.some(log => log.includes('Issue #1'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('Test Issue'))).toBe(true)
    expect(cmd.logs.some(log => log.includes('--- Project: project-a'))).toBe(
      true
    )
  })

  it('should show no results message when nothing found', async () => {
    const { default: Command } = await import('./show.js')

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('No entities found'))).toBe(true)
  })

  it('should output JSON for single issue match', async () => {
    const { default: Command } = await import('./show.js')
    const issueData = {
      issue: createMockIssue(),
      projectName: 'project-a',
      projectPath: '/path/to/project-a',
    }
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [issueData],
      totalCount: 1,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    const output = JSON.parse(cmd.logs[0])
    expect(output.issues).toHaveLength(1)
    expect(output.errors).toHaveLength(0)
  })

  it('should output JSON when no results found', async () => {
    const { default: Command } = await import('./show.js')

    const cmd = createMockCommand(Command, {
      flags: { json: true },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    const output = JSON.parse(cmd.logs[0])
    expect(output.issues).toHaveLength(0)
  })

  it('should show errors from search', async () => {
    const { default: Command } = await import('./show.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [],
      totalCount: 0,
      errors: ['Failed to search project-x'],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.warnings.some(w => w.includes('Some projects could not'))).toBe(
      true
    )
  })

  it('should show errors alongside results', async () => {
    const { default: Command } = await import('./show.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [
        {
          issue: createMockIssue(),
          projectName: 'project-a',
          projectPath: '/path/to/project-a',
        },
      ],
      totalCount: 1,
      errors: ['Failed to search project-x'],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Issue #1'))).toBe(true)
    expect(cmd.warnings.some(w => w.includes('Some projects could not'))).toBe(
      true
    )
  })

  it('should display issue description', async () => {
    const { default: Command } = await import('./show.js')
    mockDaemonGetIssuesByUuid.mockResolvedValue({
      issues: [
        {
          issue: createMockIssue({ description: 'A detailed description' }),
          projectName: 'project-a',
          projectPath: '/path/to/project-a',
        },
      ],
      totalCount: 1,
      errors: [],
    })

    const cmd = createMockCommand(Command, {
      flags: { json: false },
      args: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    })

    await cmd.run()

    expect(cmd.logs.some(log => log.includes('Description:'))).toBe(true)
  })
})
