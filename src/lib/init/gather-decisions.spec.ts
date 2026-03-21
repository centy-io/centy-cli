import { describe, expect, it } from 'vitest'
import { gatherDecisions } from './gather-decisions.js'

describe('gatherDecisions', () => {
  it('should return empty decisions when plan has no files', async () => {
    const plan = { toRestore: [], toReset: [] }
    const opts = {}
    const output = process.stdout
    const result = await gatherDecisions(plan, opts, output)
    expect(result).toEqual({ restore: [], reset: [], skip: [] })
  })
})
