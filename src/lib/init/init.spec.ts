import { Writable } from 'node:stream'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockIsGitRepo = vi.fn()

vi.mock('../../utils/is-git-repo.js', () => ({
  isGitRepo: (cwd: unknown) => mockIsGitRepo(cwd),
}))

const { init } = await import('./init.js')

function createOutputCollector(): {
  stream: Writable
  getOutput: () => string
} {
  let captured = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      captured += String(chunk)
      callback()
    },
  })
  return { stream, getOutput: () => captured }
}

describe('init', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsGitRepo.mockReturnValue(false)
  })

  it('should return error when not in a git repository', async () => {
    const collector = createOutputCollector()

    const result = await init({
      cwd: '/nonexistent/path',
      output: collector.stream,
    })

    expect(result.success).toBe(false)
    expect(collector.getOutput()).toContain('Not inside a git repository')
  })

  it('should block init when not in a git repo without --no-git', async () => {
    mockIsGitRepo.mockReturnValue(false)
    const collector = createOutputCollector()

    const result = await init({
      cwd: '/no-git-path',
      output: collector.stream,
    })

    expect(result.success).toBe(false)
    expect(collector.getOutput()).toContain('--no-git')
  })

  it('should show warning and continue when skipGitCheck is true', async () => {
    mockIsGitRepo.mockReturnValue(false)
    const collector = createOutputCollector()

    // Will fail at daemon step, but should show the warning first
    const result = await init({
      cwd: '/no-git-path',
      skipGitCheck: true,
      output: collector.stream,
    })

    expect(collector.getOutput()).toContain(
      'Warning: Initializing outside a git repository'
    )
    // Fails at daemon step (daemon not running), not at git check
    expect(result.success).toBe(false)
  })

  it('should return result with required properties', async () => {
    const result = await init({
      cwd: '/nonexistent/path',
    })

    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('centyPath')
    expect(result).toHaveProperty('created')
    expect(result).toHaveProperty('restored')
    expect(result).toHaveProperty('reset')
    expect(result).toHaveProperty('skipped')
    expect(result).toHaveProperty('userFiles')
  })
})
