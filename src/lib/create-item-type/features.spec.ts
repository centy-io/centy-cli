import { describe, expect, it } from 'vitest'
import {
  InvalidFeatureError,
  mapFeatureToEnum,
  parseFeatures,
} from './features.js'

describe('mapFeatureToEnum', () => {
  it('maps known features to enum values', () => {
    expect(mapFeatureToEnum('display-number')).toBe(
      'ITEM_TYPE_FEATURE_DISPLAY_NUMBER'
    )
    expect(mapFeatureToEnum('status')).toBe('ITEM_TYPE_FEATURE_STATUS')
    expect(mapFeatureToEnum('priority')).toBe('ITEM_TYPE_FEATURE_PRIORITY')
    expect(mapFeatureToEnum('move')).toBe('ITEM_TYPE_FEATURE_MOVE')
    expect(mapFeatureToEnum('duplicate')).toBe('ITEM_TYPE_FEATURE_DUPLICATE')
  })

  it('returns input for unknown features', () => {
    expect(mapFeatureToEnum('unknown')).toBe('unknown')
  })
})

describe('parseFeatures', () => {
  it('returns empty array for undefined', () => {
    expect(parseFeatures(undefined)).toEqual([])
  })

  it('parses comma-separated features', () => {
    const result = parseFeatures('status,priority,move')
    expect(result).toEqual([
      'ITEM_TYPE_FEATURE_STATUS',
      'ITEM_TYPE_FEATURE_PRIORITY',
      'ITEM_TYPE_FEATURE_MOVE',
    ])
  })

  it('trims whitespace', () => {
    const result = parseFeatures(' status , priority ')
    expect(result).toEqual([
      'ITEM_TYPE_FEATURE_STATUS',
      'ITEM_TYPE_FEATURE_PRIORITY',
    ])
  })

  it('throws InvalidFeatureError for invalid features', () => {
    expect(() => parseFeatures('status,invalid')).toThrow(InvalidFeatureError)
    expect(() => parseFeatures('status,invalid')).toThrow(
      'Invalid feature "invalid"'
    )
  })
})
