import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockExecSync = vi.fn()

vi.mock('node:child_process', () => ({
  execSync: (...args: unknown[]) => mockExecSync(...args),
}))

const { isGitRepo } = await import('./is-git-repo.js')

describe('isGitRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when inside a git repository', () => {
    mockExecSync.mockReturnValue(undefined)

    const result = isGitRepo('/some/git/project')

    expect(result).toBe(true)
    expect(mockExecSync).toHaveBeenCalledWith('git rev-parse --git-dir', {
      cwd: '/some/git/project',
      stdio: 'ignore',
    })
  })

  it('should return false when not inside a git repository', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repository')
    })

    const result = isGitRepo('/tmp/no-git')

    expect(result).toBe(false)
  })
})
