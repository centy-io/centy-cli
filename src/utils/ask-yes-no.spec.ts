import prompts from 'prompts'
import { describe, expect, it } from 'vitest'
import { askYesNo } from './ask-yes-no.js'

describe('askYesNo', () => {
  it('should return true when user confirms', async () => {
    prompts.inject([true])
    const result = await askYesNo('Continue?', undefined)
    expect(result).toBe(true)
  })

  it('should return false when user denies', async () => {
    prompts.inject([false])
    const result = await askYesNo('Continue?', undefined)
    expect(result).toBe(false)
  })

  it('should return false (default) when defaultYes is false and prompt is cancelled', async () => {
    prompts.inject([undefined])
    const result = await askYesNo('Continue?', false)
    expect(result).toBe(false)
  })

  it('should return true (default) when defaultYes is true and prompt is cancelled', async () => {
    prompts.inject([undefined])
    const result = await askYesNo('Continue?', true)
    expect(result).toBe(true)
  })

  it('should use false as default when defaultYes is undefined and prompt is cancelled', async () => {
    prompts.inject([undefined])
    const result = await askYesNo('Continue?', undefined)
    expect(result).toBe(false)
  })
})
