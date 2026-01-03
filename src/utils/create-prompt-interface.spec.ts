import { createInterface } from 'node:readline'
import { Readable, Writable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import { createPromptInterface } from './create-prompt-interface.js'

vi.mock('node:readline', () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn(),
  })),
}))

describe('createPromptInterface', () => {
  it('should create interface with default streams', () => {
    createPromptInterface()

    expect(createInterface).toHaveBeenCalledWith({
      input: process.stdin,
      output: process.stdout,
    })
  })

  it('should create interface with custom streams', () => {
    const mockInput = new Readable()
    const mockOutput = new Writable()

    createPromptInterface(mockInput, mockOutput)

    expect(createInterface).toHaveBeenCalledWith({
      input: mockInput,
      output: mockOutput,
    })
  })

  it('should use default input when only output provided', () => {
    const mockOutput = new Writable()

    createPromptInterface(undefined, mockOutput)

    expect(createInterface).toHaveBeenCalledWith({
      input: process.stdin,
      output: mockOutput,
    })
  })
})
