import { describe, it, expect } from 'vitest'
import { formatDryRun } from './format-dry-run.js'

describe('formatDryRun', () => {
  it('should be a function', () => {
    expect(typeof formatDryRun).toBe('function')
  })
})
