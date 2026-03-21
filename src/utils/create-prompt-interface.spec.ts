import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockQuestion = vi.fn()
const mockClose = vi.fn()

vi.mock('node:readline', () => ({
  createInterface: vi.fn(() => ({
    question: mockQuestion,
    close: mockClose,
  })),
}))

describe('promptQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the user answer when input is received', async () => {
    mockQuestion.mockImplementation(
      (_q: string, cb: (answer: string) => void) => {
        cb('y')
      }
    )

    const { promptQuestion } = await import('./create-prompt-interface.js')
    const result = await promptQuestion('Confirm? (y/N) ')

    expect(result).toBe('y')
    expect(mockClose).toHaveBeenCalled()
  })

  it('should return null when the timeout expires', async () => {
    mockQuestion.mockImplementation(() => {
      // never calls callback — simulates hanging
    })

    const { promptQuestion } = await import('./create-prompt-interface.js')
    const resultPromise = promptQuestion('Confirm? (y/N) ', 1000)

    vi.advanceTimersByTime(1000)

    const result = await resultPromise

    expect(result).toBeNull()
    expect(mockClose).toHaveBeenCalled()
  })

  it('should clear the timeout when answer arrives before timeout', async () => {
    mockQuestion.mockImplementation(
      (_q: string, cb: (answer: string) => void) => {
        cb('n')
      }
    )

    const { promptQuestion } = await import('./create-prompt-interface.js')
    const result = await promptQuestion('Confirm? (y/N) ', 5000)

    expect(result).toBe('n')
    expect(mockClose).toHaveBeenCalled()
  })
})
