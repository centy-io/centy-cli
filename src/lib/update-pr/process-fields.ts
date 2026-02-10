/* eslint-disable single-export/single-export */

export const PRIORITY_MAP: Record<string, number> = {
  high: 1,
  medium: 2,
  low: 3,
}

export function parseReviewers(
  reviewers: string | undefined
): string[] | undefined {
  if (reviewers === undefined) {
    return undefined
  }
  return reviewers.split(',').map(s => s.trim())
}

export function hasAnyUpdates(flags: Record<string, unknown>): boolean {
  return Boolean(
    flags['title'] ||
    flags['description'] ||
    flags['status'] ||
    flags['source'] ||
    flags['target'] ||
    flags['issues'] ||
    flags['reviewers'] ||
    flags['priority']
  )
}
