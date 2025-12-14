import { describe, expect, it, vi } from 'vitest'
import { closePromptInterface } from './close-prompt-interface.js'

describe('closePromptInterface', () => {
  it('should call close on the interface', () => {
    const mockInterface = {
      close: vi.fn(),
      question: vi.fn(),
    } as unknown as import('node:readline').Interface

    closePromptInterface(mockInterface)

    expect(mockInterface.close).toHaveBeenCalled()
  })
})
