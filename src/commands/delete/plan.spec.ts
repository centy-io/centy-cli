import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeletePlan = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()
const mockCreateInterface = vi.fn()

vi.mock('../../daemon/daemon-delete-plan.js', () => ({
  daemonDeletePlan: (...args: unknown[]) => mockDaemonDeletePlan(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

vi.mock('node:readline', () => ({
  createInterface: () => mockCreateInterface(),
}))

function setupReadlineMock(answer: string) {
  mockCreateInterface.mockReturnValue({
    question: (_prompt: string, callback: (answer: string) => void) => {
      callback(answer)
    },
    close: vi.fn(),
  })
}

describe('DeletePlan command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./plan.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should delete plan with force flag', async () => {
    const { default: Command } = await import('./plan.js')
    mockDaemonDeletePlan.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeletePlan).toHaveBeenCalledWith({
      projectPath: '/test/project',
      issueId: '1',
    })
    expect(cmd.logs.some(log => log.includes('Deleted plan'))).toBe(true)
  })

  it('should delete plan after confirmation', async () => {
    const { default: Command } = await import('./plan.js')
    setupReadlineMock('y')
    mockDaemonDeletePlan.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeletePlan).toHaveBeenCalled()
  })

  it('should cancel when user answers no', async () => {
    const { default: Command } = await import('./plan.js')
    setupReadlineMock('n')

    const cmd = createMockCommand(Command, {
      flags: { force: false },
      args: { issueId: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeletePlan).not.toHaveBeenCalled()
    expect(cmd.logs.some(log => log.includes('Cancelled'))).toBe(true)
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./plan.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should handle daemon delete failure', async () => {
    const { default: Command } = await import('./plan.js')
    mockDaemonDeletePlan.mockResolvedValue({
      success: false,
      error: 'Plan not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { issueId: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Plan not found')
  })

  it('should handle non-Error throws', async () => {
    const { default: Command } = await import('./plan.js')
    mockEnsureInitialized.mockRejectedValue('string error')

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { issueId: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
  })
})
