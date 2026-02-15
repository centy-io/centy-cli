import { execSync } from 'node:child_process'
import { describe, it, expect, vi } from 'vitest'
import { INSTALL_TIMEOUT_MS } from '../../utils/process-timeout-config.js'
import { handleMissingDaemon } from './handle-missing-daemon.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

vi.mock('../../utils/create-prompt-interface.js', () => ({
  createPromptInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn(),
  })),
}))

vi.mock('../../utils/close-prompt-interface.js', () => ({
  closePromptInterface: vi.fn(),
}))

vi.mock('./prompt-for-install.js', () => ({
  promptForInstall: vi.fn(),
}))

describe('handleMissingDaemon', () => {
  it('should be a function', () => {
    expect(typeof handleMissingDaemon).toBe('function')
  })

  it('should pass timeout to execSync when installing', async () => {
    const log = vi.fn()
    await handleMissingDaemon('/path/to/daemon', true, 'npm install', log)

    expect(execSync).toHaveBeenCalledWith('npm install', {
      stdio: 'inherit',
      timeout: INSTALL_TIMEOUT_MS,
      env: expect.objectContaining({ BINARIES: 'centy-daemon' }),
    })
  })
})
