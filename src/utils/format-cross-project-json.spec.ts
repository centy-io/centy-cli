import { describe, it, expect } from 'vitest'
import { formatCrossProjectJson } from './format-cross-project-json.js'

describe('formatCrossProjectJson', () => {
  it('should return structured JSON object', () => {
    const result = formatCrossProjectJson('issue', 'abc-123', [
      { projectName: 'my-project', projectPath: '/path/to/project' },
    ])

    expect(result).toEqual({
      error: 'NOT_FOUND',
      message: 'issue not found in current project',
      foundIn: [{ projectName: 'my-project', projectPath: '/path/to/project' }],
      suggestion: 'Run: centy get issue abc-123 --global',
    })
  })

  it('should include displayNumber when provided', () => {
    const result = formatCrossProjectJson('issue', 'abc-123', [
      {
        projectName: 'my-project',
        projectPath: '/path/to/project',
        displayNumber: 5,
      },
    ])

    expect(
      (result as { foundIn: Array<{ displayNumber?: number }> }).foundIn[0]
        .displayNumber
    ).toBe(5)
  })

  it('should format for pr entity', () => {
    const result = formatCrossProjectJson('pr', 'uuid-456', [
      { projectName: 'project1', projectPath: '/path/1' },
    ])

    expect(result).toEqual({
      error: 'NOT_FOUND',
      message: 'pr not found in current project',
      foundIn: [{ projectName: 'project1', projectPath: '/path/1' }],
      suggestion: 'Run: centy get pr uuid-456 --global',
    })
  })
})
