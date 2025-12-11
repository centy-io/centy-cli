import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockDaemonIsInitialized = vi.fn()

vi.mock('../daemon/daemon-is-initialized.js', () => ({
  daemonIsInitialized: (args: unknown) => mockDaemonIsInitialized(args),
}))

const { ensureInitialized, NotInitializedError } =
  await import('./ensure-initialized.js')

describe('ensureInitialized', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return centyPath when initialized', async () => {
    mockDaemonIsInitialized.mockResolvedValue({
      initialized: true,
      centyPath: '/project/.centy',
    })

    const result = await ensureInitialized('/project')

    expect(result).toBe('/project/.centy')
    expect(mockDaemonIsInitialized).toHaveBeenCalledWith({
      projectPath: '/project',
    })
  })

  it('should throw NotInitializedError when not initialized', async () => {
    mockDaemonIsInitialized.mockResolvedValue({
      initialized: false,
      centyPath: '',
    })

    await expect(ensureInitialized('/empty')).rejects.toThrow(
      NotInitializedError
    )
  })
})

describe('NotInitializedError', () => {
  it('should have correct name', () => {
    const error = new NotInitializedError('/test')
    expect(error.name).toBe('NotInitializedError')
  })

  it('should include cwd in message', () => {
    const error = new NotInitializedError('/my/project')
    expect(error.message).toContain('/my/project')
  })

  it('should suggest running centy init', () => {
    const error = new NotInitializedError('/test')
    expect(error.message).toContain('centy init')
  })
})
