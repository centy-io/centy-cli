import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDaemonGetManifest = vi.fn()
const mockDaemonGetDaemonInfo = vi.fn()

vi.mock('./daemon-get-manifest.js', () => ({
  daemonGetManifest: (...args: unknown[]) => mockDaemonGetManifest(...args),
}))

vi.mock('./daemon-get-daemon-info.js', () => ({
  daemonGetDaemonInfo: (...args: unknown[]) => mockDaemonGetDaemonInfo(...args),
}))

const { getProjectVersionStatus, isSemverBehind } =
  await import('./daemon-get-project-version.js')

describe('isSemverBehind', () => {
  it('returns true when major version is behind', () => {
    expect(isSemverBehind('0.5.0', '1.0.0')).toBe(true)
  })

  it('returns true when minor version is behind', () => {
    expect(isSemverBehind('1.2.0', '1.3.0')).toBe(true)
  })

  it('returns true when patch version is behind', () => {
    expect(isSemverBehind('1.2.3', '1.2.4')).toBe(true)
  })

  it('returns false when versions are equal', () => {
    expect(isSemverBehind('1.2.3', '1.2.3')).toBe(false)
  })

  it('returns false when project version is ahead', () => {
    expect(isSemverBehind('2.0.0', '1.9.9')).toBe(false)
  })

  it('returns false when either version is not valid semver', () => {
    expect(isSemverBehind('invalid', '1.0.0')).toBe(false)
    expect(isSemverBehind('1.0.0', 'invalid')).toBe(false)
    expect(isSemverBehind('', '1.0.0')).toBe(false)
  })
})

describe('getProjectVersionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the module-level cache between tests by re-importing
    vi.resetModules()
  })

  it('returns null when project has no version set', async () => {
    mockDaemonGetManifest.mockResolvedValue({
      centyVersion: '',
      schemaVersion: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    mockDaemonGetDaemonInfo.mockResolvedValue({ version: '1.0.0' })

    const { getProjectVersionStatus: freshFn } =
      await import('./daemon-get-project-version.js')
    const result = await freshFn('/some/project')
    expect(result).toBeNull()
  })

  it('returns status with isProjectBehind true when project is behind', async () => {
    mockDaemonGetManifest.mockResolvedValue({
      centyVersion: '0.5.0',
      schemaVersion: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    mockDaemonGetDaemonInfo.mockResolvedValue({ version: '1.0.0' })

    const { getProjectVersionStatus: freshFn } =
      await import('./daemon-get-project-version.js')
    const result = await freshFn('/some/project')
    expect(result).toEqual({
      projectVersion: '0.5.0',
      daemonVersion: '1.0.0',
      isProjectBehind: true,
    })
  })

  it('returns status with isProjectBehind false when versions match', async () => {
    mockDaemonGetManifest.mockResolvedValue({
      centyVersion: '1.0.0',
      schemaVersion: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    mockDaemonGetDaemonInfo.mockResolvedValue({ version: '1.0.0' })

    const { getProjectVersionStatus: freshFn } =
      await import('./daemon-get-project-version.js')
    const result = await freshFn('/some/project')
    expect(result).toEqual({
      projectVersion: '1.0.0',
      daemonVersion: '1.0.0',
      isProjectBehind: false,
    })
  })

  it('returns null on daemon error', async () => {
    mockDaemonGetManifest.mockRejectedValue(new Error('Manifest not found'))
    mockDaemonGetDaemonInfo.mockResolvedValue({ version: '1.0.0' })

    const { getProjectVersionStatus: freshFn } =
      await import('./daemon-get-project-version.js')
    const result = await freshFn('/uninitialized/project')
    expect(result).toBeNull()
  })

  it('returns null on daemon info error', async () => {
    mockDaemonGetManifest.mockResolvedValue({
      centyVersion: '0.5.0',
      schemaVersion: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    mockDaemonGetDaemonInfo.mockRejectedValue(new Error('Daemon unavailable'))

    const { getProjectVersionStatus: freshFn } =
      await import('./daemon-get-project-version.js')
    const result = await freshFn('/some/project')
    expect(result).toBeNull()
  })
})
