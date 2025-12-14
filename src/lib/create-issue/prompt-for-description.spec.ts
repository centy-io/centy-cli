import { describe, expect, it, vi } from 'vitest'
import { promptForDescription } from './prompt-for-description.js'

describe('promptForDescription', () => {
  it('should prompt for description and return trimmed answer', async () => {
    const mockRl = {
      question: vi.fn((prompt: string, callback: (answer: string) => void) => {
        callback('  Test description  ')
      }),
    } as unknown as import('node:readline').Interface

    const mockOutput = {
      write: vi.fn(),
    } as unknown as NodeJS.WritableStream

    const result = await promptForDescription(mockRl, mockOutput)

    expect(mockOutput.write).toHaveBeenCalledWith(
      'Enter issue description (optional): '
    )
    expect(result).toBe('Test description')
  })

  it('should return empty string for empty input', async () => {
    const mockRl = {
      question: vi.fn((prompt: string, callback: (answer: string) => void) => {
        callback('')
      }),
    } as unknown as import('node:readline').Interface

    const mockOutput = {
      write: vi.fn(),
    } as unknown as NodeJS.WritableStream

    const result = await promptForDescription(mockRl, mockOutput)

    expect(result).toBe('')
  })
})
