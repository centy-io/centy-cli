/* eslint-disable single-export/single-export */

import { join } from 'node:path'
import type { CreatePrResult } from '../../types/create-pr-result.js'

const CENTY_FOLDER = '.centy'
const PRS_FOLDER = 'prs'

export function buildPrPaths(
  cwd: string,
  prId: string
): { prFolderPath: string; prMdPath: string; metadataPath: string } {
  const centyPath = join(cwd, CENTY_FOLDER)
  const prsPath = join(centyPath, PRS_FOLDER)
  const prFolderPath = join(prsPath, prId)
  return {
    prFolderPath,
    prMdPath: join(prFolderPath, 'pr.md'),
    metadataPath: join(prFolderPath, 'metadata.json'),
  }
}

export function handleDaemonError(error: unknown): CreatePrResult {
  const msg = error instanceof Error ? error.message : String(error)
  if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
    return {
      success: false,
      error: 'Centy daemon is not running. Please start the daemon first.',
    }
  }
  return { success: false, error: msg }
}

export function convertCustomFields(
  fields: Record<string, unknown> | undefined
): Record<string, string> {
  const result: Record<string, string> = {}
  if (fields !== undefined) {
    for (const [key, value] of Object.entries(fields)) {
      // eslint-disable-next-line security/detect-object-injection
      result[key] = String(value)
    }
  }
  return result
}

/**
 * Convert string priority to numeric priority
 * 1 = high (highest), 2 = medium, 3 = low
 * 0 = use default
 */
export function convertPriority(
  priority: 'low' | 'medium' | 'high' | undefined
): number {
  switch (priority) {
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'low':
      return 3
    // eslint-disable-next-line no-restricted-syntax
    default:
      return 0 // use default
  }
}
