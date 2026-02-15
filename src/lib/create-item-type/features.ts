/* eslint-disable single-export/single-export */

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

const FEATURE_TO_ENUM: Record<string, string> = {
  'display-number': 'ITEM_TYPE_FEATURE_DISPLAY_NUMBER',
  status: 'ITEM_TYPE_FEATURE_STATUS',
  priority: 'ITEM_TYPE_FEATURE_PRIORITY',
  assets: 'ITEM_TYPE_FEATURE_ASSETS',
  'org-sync': 'ITEM_TYPE_FEATURE_ORG_SYNC',
  move: 'ITEM_TYPE_FEATURE_MOVE',
  duplicate: 'ITEM_TYPE_FEATURE_DUPLICATE',
}

/**
 * Map a CLI feature name to the gRPC enum value
 */
export function mapFeatureToEnum(feature: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const mapped = FEATURE_TO_ENUM[feature]
  if (mapped === undefined) {
    return feature
  }
  return mapped
}

/**
 * Parse and validate a comma-separated features string.
 * Returns the gRPC enum values for each feature.
 * Throws if any feature is invalid.
 */
export function parseFeatures(featuresFlag: string | undefined): string[] {
  if (featuresFlag === undefined) {
    return []
  }
  const result: string[] = []
  for (const f of featuresFlag.split(',').map(s => s.trim())) {
    if (!VALID_FEATURES.includes(f)) {
      throw new InvalidFeatureError(f, VALID_FEATURES)
    }
    result.push(mapFeatureToEnum(f))
  }
  return result
}
