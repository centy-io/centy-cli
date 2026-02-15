import { describe, expect, it } from 'vitest'
import { buildConfigFromOptions, init } from './init.js'

describe('init', () => {
  it('should return error when daemon is not running', async () => {
    const result = await init({
      cwd: '/nonexistent/path',
    })

    expect(result.success).toBe(false)
  })

  it('should return result with required properties', async () => {
    const result = await init({
      cwd: '/nonexistent/path',
    })

    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('centyPath')
    expect(result).toHaveProperty('created')
    expect(result).toHaveProperty('restored')
    expect(result).toHaveProperty('reset')
    expect(result).toHaveProperty('skipped')
    expect(result).toHaveProperty('userFiles')
  })
})

describe('buildConfigFromOptions', () => {
  it('should return undefined when no config options are provided', () => {
    const result = buildConfigFromOptions({})
    expect(result).toBeUndefined()
  })

  it('should return undefined when only non-config options are provided', () => {
    const result = buildConfigFromOptions({
      cwd: '/some/path',
      force: true,
    })
    expect(result).toBeUndefined()
  })

  it('should build config with priorityLevels', () => {
    const result = buildConfigFromOptions({ priorityLevels: 5 })
    expect(result).toBeDefined()
    expect(result!.priorityLevels).toBe(5)
  })

  it('should build config with allowedStates', () => {
    const result = buildConfigFromOptions({
      allowedStates: ['open', 'closed'],
    })
    expect(result).toBeDefined()
    expect(result!.allowedStates).toEqual(['open', 'closed'])
  })

  it('should build config with version', () => {
    const result = buildConfigFromOptions({ version: '1.0.0' })
    expect(result).toBeDefined()
    expect(result!.version).toBe('1.0.0')
  })

  it('should build config with all options combined', () => {
    const result = buildConfigFromOptions({
      priorityLevels: 5,
      allowedStates: ['todo', 'doing', 'done'],
      version: '2.0.0',
    })
    expect(result).toBeDefined()
    expect(result!.priorityLevels).toBe(5)
    expect(result!.allowedStates).toEqual(['todo', 'doing', 'done'])
    expect(result!.version).toBe('2.0.0')
    // Non-configurable fields should have defaults
    expect(result!.customFields).toEqual([])
    expect(result!.defaults).toEqual({})
    expect(result!.stateColors).toEqual({})
    expect(result!.priorityColors).toEqual({})
    expect(result!.customLinkTypes).toEqual([])
  })

  it('should use default values for unset config fields', () => {
    const result = buildConfigFromOptions({ priorityLevels: 3 })
    expect(result).toBeDefined()
    expect(result!.priorityLevels).toBe(3)
    // Unset fields should use proto defaults (0, '', [])
    expect(result!.allowedStates).toEqual([])
    expect(result!.version).toBe('')
  })
})
