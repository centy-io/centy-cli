import { spawn } from 'node:child_process'
import { describe, it, expect, vi } from 'vitest'
import { startForeground } from './start-foreground.js'

vi.mock('node:child_process', () => {
  const mockChild = {
    on: vi.fn(),
    kill: vi.fn(),
  }
  return {
    spawn: vi.fn(() => mockChild),
    __mockChild: mockChild,
  }
})

describe('startForeground', () => {
  it('should be a function', () => {
    expect(typeof startForeground).toBe('function')
  })

  it('should spawn daemon with stdio inherit', () => {
    const log = vi.fn()
    const handleError = vi.fn()

    // Don't await - just verify spawn was called
    void startForeground('/path/to/daemon', log, handleError)

    expect(spawn).toHaveBeenCalledWith('/path/to/daemon', [], {
      stdio: 'inherit',
    })
  })

  it('should accept an optional timeout parameter', () => {
    const log = vi.fn()
    const handleError = vi.fn()

    // Verify the function accepts 4 parameters without error
    void startForeground('/path/to/daemon', log, handleError, 30000)

    expect(spawn).toHaveBeenCalled()
  })
})
