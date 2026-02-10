import { describe, it, expect } from 'vitest'
import { saveMigration, saveCompact } from './save-results.js'

describe('save-results', () => {
  it('saveMigration should be a function', () => {
    expect(typeof saveMigration).toBe('function')
  })

  it('saveCompact should be a function', () => {
    expect(typeof saveCompact).toBe('function')
  })
})
