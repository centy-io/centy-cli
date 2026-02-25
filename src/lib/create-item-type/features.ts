/* eslint-disable single-export/single-export */

import type { ItemTypeFeatures } from '../../daemon/types.js'

export class InvalidFeatureError extends Error {
  constructor(feature: string, validFeatures: string[]) {
    super(
      `Invalid feature "${feature}". Valid features: ${validFeatures.join(', ')}`
    )
    this.name = 'InvalidFeatureError'
  }
}

/**
 * Valid feature names for item types
 */
export const VALID_FEATURES = [
  'display-number',
  'status',
  'priority',
  'assets',
  'org-sync',
  'move',
  'duplicate',
]

/**
 * Parse and validate a comma-separated features string.
 * Returns an ItemTypeFeatures message with boolean fields.
 * Throws if any feature is invalid.
 */
export function parseFeatures(
  featuresFlag: string | undefined
): ItemTypeFeatures {
  const enabled = new Set<string>()
  if (featuresFlag !== undefined) {
    for (const f of featuresFlag.split(',').map(s => s.trim())) {
      if (!VALID_FEATURES.includes(f)) {
        throw new InvalidFeatureError(f, VALID_FEATURES)
      }
      enabled.add(f)
    }
  }
  return {
    displayNumber: enabled.has('display-number'),
    status: enabled.has('status'),
    priority: enabled.has('priority'),
    assets: enabled.has('assets'),
    orgSync: enabled.has('org-sync'),
    move: enabled.has('move'),
    duplicate: enabled.has('duplicate'),
  }
}
