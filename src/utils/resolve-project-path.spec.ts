import { homedir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockDaemonListProjects = vi.fn()

vi.mock('../daemon/daemon-list-projects.js', () => ({
  daemonListProjects: (args: unknown) => mockDaemonListProjects(args),
}))

const { resolveProjectPath, ProjectNotFoundError } =
  await import('./resolve-project-path.js')

describe('resolveProjectPath', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    // eslint-disable-next-line no-restricted-syntax
    delete process.env['CENTY_CWD']
  })

  describe('path input', () => {
    it('should return absolute paths as-is', async () => {
      const result = await resolveProjectPath('/absolute/path')
      expect(result).toBe('/absolute/path')
    })

    it('should return relative paths starting with dot', async () => {
      const result = await resolveProjectPath('./relative')
      expect(result).toBe('./relative')
    })

    it('should expand tilde to home directory', async () => {
      const result = await resolveProjectPath('~/projects')
      expect(result).toBe(join(homedir(), 'projects'))
    })

    it('should return paths with slashes', async () => {
      const result = await resolveProjectPath('some/path')
      expect(result).toBe('some/path')
    })
  })

  describe('project name lookup', () => {
    it('should look up project by name', async () => {
      mockDaemonListProjects.mockResolvedValue({
        projects: [{ name: 'my-project', path: '/home/user/my-project' }],
      })

      const result = await resolveProjectPath('my-project')
      expect(result).toBe('/home/user/my-project')
    })

    it('should match project name case-insensitively', async () => {
      mockDaemonListProjects.mockResolvedValue({
        projects: [{ name: 'MyProject', path: '/home/user/MyProject' }],
      })

      const result = await resolveProjectPath('myproject')
      expect(result).toBe('/home/user/MyProject')
    })

    it('should throw ProjectNotFoundError when project not found', async () => {
      mockDaemonListProjects.mockResolvedValue({ projects: [] })

      await expect(resolveProjectPath('unknown')).rejects.toThrow(
        ProjectNotFoundError
      )
    })
  })

  describe('default behavior', () => {
    it('should use CENTY_CWD env var when no arg provided', async () => {
      // eslint-disable-next-line no-restricted-syntax
      process.env['CENTY_CWD'] = '/env/path'
      const result = await resolveProjectPath(undefined)
      expect(result).toBe('/env/path')
    })

    it('should use cwd when no arg and no env var', async () => {
      const result = await resolveProjectPath(undefined)
      expect(result).toBe(process.cwd())
    })
  })
})

describe('ProjectNotFoundError', () => {
  it('should have correct name', () => {
    const error = new ProjectNotFoundError('test-project')
    expect(error.name).toBe('ProjectNotFoundError')
  })

  it('should include project name in message', () => {
    const error = new ProjectNotFoundError('my-project')
    expect(error.message).toContain('my-project')
  })

  it('should suggest using centy list projects', () => {
    const error = new ProjectNotFoundError('test')
    expect(error.message).toContain('centy list projects')
  })
})
