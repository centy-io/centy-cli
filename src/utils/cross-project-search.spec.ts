import { describe, it, expect } from 'vitest'
import {
  formatCrossProjectHint,
  formatCrossProjectJson,
  isNotFoundError,
} from './cross-project-search.js'

describe('formatCrossProjectHint', () => {
  it('should format hint for issue entity', () => {
    const result = formatCrossProjectHint('issue', 'abc-123', [
      { projectName: 'my-project', projectPath: '/path/to/project' },
    ])

    expect(result).toContain('Issue not found in current project.')
    expect(result).toContain('Found in:')
    expect(result).toContain('my-project (/path/to/project)')
    expect(result).toContain('centy get issue abc-123 --global')
  })

  it('should format hint for multiple projects', () => {
    const result = formatCrossProjectHint('pr', 'uuid-456', [
      { projectName: 'project1', projectPath: '/path/1' },
      { projectName: 'project2', projectPath: '/path/2' },
    ])

    expect(result).toContain('Pr not found in current project.')
    expect(result).toContain('project1 (/path/1)')
    expect(result).toContain('project2 (/path/2)')
  })
})

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
      // eslint-disable-next-line no-restricted-syntax
      (result as { foundIn: Array<{ displayNumber?: number }> }).foundIn[0]
        .displayNumber
    ).toBe(5)
  })
})

describe('isNotFoundError', () => {
  it('should return true for NOT_FOUND error code (5)', () => {
    const error = { code: 5, message: 'Not found' }
    expect(isNotFoundError(error)).toBe(true)
  })

  it('should return false for other error codes', () => {
    const error = { code: 2, message: 'Unknown' }
    expect(isNotFoundError(error)).toBe(false)
  })

  it('should return false for null', () => {
    expect(isNotFoundError(null)).toBe(false)
  })

  it('should return false for non-object', () => {
    expect(isNotFoundError('error')).toBe(false)
  })

  it('should return false for object without code', () => {
    expect(isNotFoundError({ message: 'error' })).toBe(false)
  })
})
