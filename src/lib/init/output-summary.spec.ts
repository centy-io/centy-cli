import { PassThrough } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { outputSummary } from './output-summary.js'

describe('outputSummary', () => {
  it('should write created files to output', () => {
    const output = new PassThrough()
    let collected = ''
    output.on('data', chunk => {
      collected += chunk.toString()
    })

    outputSummary(output, {
      success: true,
      centyPath: '/test/.centy',
      created: ['file1.md', 'file2.json'],
      restored: [],
      reset: [],
      skipped: [],
      userFiles: [],
    })

    expect(collected).toContain('Created file1.md')
    expect(collected).toContain('Created file2.json')
  })

  it('should write restored files to output', () => {
    const output = new PassThrough()
    let collected = ''
    output.on('data', chunk => {
      collected += chunk.toString()
    })

    outputSummary(output, {
      success: true,
      centyPath: '/test/.centy',
      created: [],
      restored: ['restored.md'],
      reset: [],
      skipped: [],
      userFiles: [],
    })

    expect(collected).toContain('Restored restored.md')
  })

  it('should write reset files to output', () => {
    const output = new PassThrough()
    let collected = ''
    output.on('data', chunk => {
      collected += chunk.toString()
    })

    outputSummary(output, {
      success: true,
      centyPath: '/test/.centy',
      created: [],
      restored: [],
      reset: ['reset.md'],
      skipped: [],
      userFiles: [],
    })

    expect(collected).toContain('Reset reset.md')
  })

  it('should write skipped files to output', () => {
    const output = new PassThrough()
    let collected = ''
    output.on('data', chunk => {
      collected += chunk.toString()
    })

    outputSummary(output, {
      success: true,
      centyPath: '/test/.centy',
      created: [],
      restored: [],
      reset: [],
      skipped: ['skipped.md'],
      userFiles: [],
    })

    expect(collected).toContain('Skipped skipped.md')
  })

  it('should write user files section when present', () => {
    const output = new PassThrough()
    let collected = ''
    output.on('data', chunk => {
      collected += chunk.toString()
    })

    outputSummary(output, {
      success: true,
      centyPath: '/test/.centy',
      created: [],
      restored: [],
      reset: [],
      skipped: [],
      userFiles: ['custom.md'],
    })

    expect(collected).toContain('User files')
    expect(collected).toContain('custom.md')
  })

  it('should show total count in summary', () => {
    const output = new PassThrough()
    let collected = ''
    output.on('data', chunk => {
      collected += chunk.toString()
    })

    outputSummary(output, {
      success: true,
      centyPath: '/test/.centy',
      created: ['a.md', 'b.md'],
      restored: ['c.md'],
      reset: [],
      skipped: [],
      userFiles: [],
    })

    expect(collected).toContain('3 managed items')
  })
})
