import { PassThrough } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { gatherIssueInput } from './gather-issue-input.js'

describe('gatherIssueInput', () => {
  it('should return provided options without prompting', async () => {
    const output = new PassThrough()

    const result = await gatherIssueInput(
      {
        title: 'Test Title',
        description: 'Test Description',
        priority: 'high',
      },
      output
    )

    expect(result.title).toBe('Test Title')
    expect(result.description).toBe('Test Description')
    expect(result.priority).toBe('high')
  })

  it('should use medium as default priority for empty title', async () => {
    const output = new PassThrough()

    // When title is empty, function returns early with default priority
    const result = await gatherIssueInput(
      {
        title: '',
        description: 'Test Description',
      },
      output
    )

    expect(result.priority).toBe('medium')
  })

  it('should return null title for empty title', async () => {
    const output = new PassThrough()

    const result = await gatherIssueInput(
      {
        title: '',
      },
      output
    )

    expect(result.title).toBeNull()
  })
})
