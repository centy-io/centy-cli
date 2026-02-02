import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getInstalledDaemonVersion } from './get-installed-version.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('./get-install-dir.js', () => ({
  getInstallDir: vi.fn(() => '/mock/.centy/bin'),
}))

vi.mock('./platform.js', () => ({
  getBinaryFileName: vi.fn((name: string) => name),
}))

describe('getInstalledDaemonVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return undefined if binary does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    const result = getInstalledDaemonVersion()
    expect(result).toBeUndefined()
  })

  it('should return version from daemon output', async () => {
    const { existsSync } = await import('node:fs')
    const { execSync } = await import('node:child_process')

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(execSync).mockReturnValue('centy-daemon 0.2.0-alpha.9\n')

    const result = getInstalledDaemonVersion()
    expect(result).toBe('0.2.0-alpha.9')
  })

  it('should return stable version from daemon output', async () => {
    const { existsSync } = await import('node:fs')
    const { execSync } = await import('node:child_process')

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(execSync).mockReturnValue('centy-daemon 1.0.0\n')

    const result = getInstalledDaemonVersion()
    expect(result).toBe('1.0.0')
  })

  it('should return undefined if execSync throws', async () => {
    const { existsSync } = await import('node:fs')
    const { execSync } = await import('node:child_process')

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('Command failed')
    })

    const result = getInstalledDaemonVersion()
    expect(result).toBeUndefined()
  })

  it('should return undefined if output format is unexpected', async () => {
    const { existsSync } = await import('node:fs')
    const { execSync } = await import('node:child_process')

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(execSync).mockReturnValue('unexpected output\n')

    const result = getInstalledDaemonVersion()
    expect(result).toBeUndefined()
  })
})
