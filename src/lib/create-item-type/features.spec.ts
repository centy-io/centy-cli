import { describe, expect, it } from 'vitest'
import { InvalidFeatureError, parseFeatures } from './features.js'

describe('parseFeatures', () => {
  it('returns all-false object for undefined', () => {
    expect(parseFeatures(undefined)).toEqual({
      displayNumber: false,
      status: false,
      priority: false,
      assets: false,
      orgSync: false,
      move: false,
      duplicate: false,
    })
  })

  it('sets enabled fields to true', () => {
    const result = parseFeatures('status,priority,move')
    expect(result).toEqual({
      displayNumber: false,
      status: true,
      priority: true,
      assets: false,
      orgSync: false,
      move: true,
      duplicate: false,
    })
  })

  it('trims whitespace', () => {
    const result = parseFeatures(' status , priority ')
    expect(result).toEqual({
      displayNumber: false,
      status: true,
      priority: true,
      assets: false,
      orgSync: false,
      move: false,
      duplicate: false,
    })
  })

  it('throws InvalidFeatureError for invalid features', () => {
    expect(() => parseFeatures('status,invalid')).toThrow(InvalidFeatureError)
    expect(() => parseFeatures('status,invalid')).toThrow(
      'Invalid feature "invalid"'
    )
  })
})
