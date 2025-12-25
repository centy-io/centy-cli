import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockLaunchTuiManager = vi.fn()

vi.mock('../lib/launch-tui-manager/index.js', () => ({
  launchTuiManager: () => mockLaunchTuiManager(),
}))

describe('Cockpit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct description', async () => {
    const { default: Cockpit } = await import('./cockpit.js')
    expect(Cockpit.description).toContain('TUI Manager')
  })

  it('should have examples', async () => {
    const { default: Cockpit } = await import('./cockpit.js')
    expect(Cockpit.examples).toBeDefined()
    expect(Cockpit.examples.length).toBeGreaterThan(0)
  })

  it('should call launchTuiManager when run', async () => {
    mockLaunchTuiManager.mockResolvedValue({ success: true })

    const { default: Cockpit } = await import('./cockpit.js')
    const cmd = createMockCommand(Cockpit, {})

    await runCommandSafely(cmd)

    expect(mockLaunchTuiManager).toHaveBeenCalled()
  })

  it('should handle error when TUI Manager fails to launch', async () => {
    mockLaunchTuiManager.mockResolvedValue({
      success: false,
      error: 'Test error',
    })

    const { default: Cockpit } = await import('./cockpit.js')
    const cmd = createMockCommand(Cockpit, {})

    await runCommandSafely(cmd)

    expect(cmd.errors.length).toBeGreaterThan(0)
  })
})
