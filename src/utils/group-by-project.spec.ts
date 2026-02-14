import { describe, expect, it } from 'vitest'
import { groupByProject } from './group-by-project.js'

describe('groupByProject', () => {
  it('should group items by project name', () => {
    const items = [
      { id: '1', projectName: 'project1' },
      { id: '2', projectName: 'project2' },
      { id: '3', projectName: 'project1' },
    ]

    const result = groupByProject(items)

    expect(result.size).toBe(2)
    expect(result.get('project1')).toHaveLength(2)
    expect(result.get('project2')).toHaveLength(1)
  })

  it('should return empty map for empty input', () => {
    const result = groupByProject([])
    expect(result.size).toBe(0)
  })

  it('should handle single project', () => {
    const items = [
      { id: '1', projectName: 'project1' },
      { id: '2', projectName: 'project1' },
    ]

    const result = groupByProject(items)

    expect(result.size).toBe(1)
    expect(result.get('project1')).toHaveLength(2)
  })
})
