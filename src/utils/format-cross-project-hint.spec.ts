import { describe, it, expect } from 'vitest'
import { formatCrossProjectHint } from './format-cross-project-hint.js'

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

  it('should format hint for doc entity', () => {
    const result = formatCrossProjectHint('doc', 'getting-started', [
      { projectName: 'docs-project', projectPath: '/path/to/docs' },
    ])

    expect(result).toContain('Doc not found in current project.')
    expect(result).toContain('centy get doc getting-started --global')
  })
})
