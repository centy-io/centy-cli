import { describe, expect, it } from 'vitest'
import { buildConfigFromOptions } from './config-builder.js'

describe('buildConfigFromOptions', () => {
  it('should return undefined when no config options are provided', () => {
    const result = buildConfigFromOptions({})
    expect(result).toBeUndefined()
  })

  it('should return config when priorityLevels is provided', () => {
    const result = buildConfigFromOptions({ priorityLevels: 5 })
    expect(result).toBeDefined()
    expect(result!.priorityLevels).toBe(5)
  })
})
