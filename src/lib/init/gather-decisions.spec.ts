import { describe, expect, it } from 'vitest'
import { gatherDecisions } from './gather-decisions.js'

describe('gatherDecisions', () => {
  it('should return empty decisions when plan has no files', async () => {
    const plan = { toRestore: [], toReset: [] }
    const opts = {}
    // eslint-disable-next-line no-restricted-syntax
    const output = { write: () => true } as NodeJS.WritableStream
    const result = await gatherDecisions(plan, opts, output)
    expect(result).toEqual({ restore: [], reset: [], skip: [] })
  })
})
