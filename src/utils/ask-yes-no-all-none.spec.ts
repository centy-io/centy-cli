import prompts from 'prompts'
import { describe, expect, it } from 'vitest'
import { askYesNoAllNone } from './ask-yes-no-all-none.js'

describe('askYesNoAllNone', () => {
  it('should return "yes" when user selects yes', async () => {
    prompts.inject(['yes'])
    const result = await askYesNoAllNone('Continue?')
    expect(result).toBe('yes')
  })

  it('should return "no" when user selects no', async () => {
    prompts.inject(['no'])
    const result = await askYesNoAllNone('Continue?')
    expect(result).toBe('no')
  })

  it('should return "all" when user selects all', async () => {
    prompts.inject(['all'])
    const result = await askYesNoAllNone('Continue?')
    expect(result).toBe('all')
  })

  it('should return "none" when user selects none', async () => {
    prompts.inject(['none'])
    const result = await askYesNoAllNone('Continue?')
    expect(result).toBe('none')
  })

  it('should return "no" when prompt is cancelled', async () => {
    prompts.inject([undefined])
    const result = await askYesNoAllNone('Continue?')
    expect(result).toBe('no')
  })
})
