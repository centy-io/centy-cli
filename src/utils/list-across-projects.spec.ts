import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDaemonListProjects = vi.fn()

vi.mock('../daemon/daemon-list-projects.js', () => ({
  daemonListProjects: (...args: unknown[]) => mockDaemonListProjects(...args),
}))

describe('listAcrossProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should aggregate entities from all projects', async () => {
    const { listAcrossProjects } = await import('./list-across-projects.js')
    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/project1', name: 'project1' },
        { path: '/project2', name: 'project2' },
      ],
      totalCount: 2,
    })

    const listFn = vi
      .fn()
      .mockResolvedValueOnce([{ id: '1' }, { id: '2' }])
      .mockResolvedValueOnce([{ id: '3' }])

    const result = await listAcrossProjects({ listFn })

    expect(result.items).toHaveLength(3)
    expect(result.errors).toHaveLength(0)
    expect(result.items[0]).toEqual({
      entity: { id: '1' },
      projectName: 'project1',
      projectPath: '/project1',
    })
  })

  it('should handle errors from individual projects', async () => {
    const { listAcrossProjects } = await import('./list-across-projects.js')
    mockDaemonListProjects.mockResolvedValue({
      projects: [
        { path: '/project1', name: 'project1' },
        { path: '/project2', name: 'project2' },
      ],
      totalCount: 2,
    })

    const listFn = vi
      .fn()
      .mockResolvedValueOnce([{ id: '1' }])
      .mockRejectedValueOnce(new Error('Access denied'))

    const result = await listAcrossProjects({ listFn })

    expect(result.items).toHaveLength(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('project2')
    expect(result.errors[0]).toContain('Access denied')
  })

  it('should return empty results when no projects exist', async () => {
    const { listAcrossProjects } = await import('./list-across-projects.js')
    mockDaemonListProjects.mockResolvedValue({
      projects: [],
      totalCount: 0,
    })

    const listFn = vi.fn()

    const result = await listAcrossProjects({ listFn })

    expect(result.items).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
    expect(listFn).not.toHaveBeenCalled()
  })
})
