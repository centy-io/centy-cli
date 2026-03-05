import type { SearchItemsResponse } from '../../daemon/types.js'

export function handleGlobalDocSearch(
  result: SearchItemsResponse,
  slug: string,
  log: (msg: string) => void,
  warn: (msg: string) => void
): void {
  if (result.items.length === 0) {
    log(`No docs found with slug: ${slug}`)
    if (result.errors.length > 0) {
      warn('Some projects could not be searched:')
      for (const err of result.errors) {
        warn(`  - ${err}`)
      }
    }
    return
  }

  log(`Found ${result.totalCount} doc(s) matching slug: ${slug}\n`)

  for (const dwp of result.items) {
    const doc = dwp.item!
    log(`--- Project: ${dwp.projectName} (${dwp.projectPath}) ---`)
    log(`Title: ${doc.title}`)
    log(`Slug: ${doc.id}`)
    log(
      `Created: ${doc.metadata !== undefined ? doc.metadata.createdAt : 'unknown'}`
    )
    log(
      `Updated: ${doc.metadata !== undefined ? doc.metadata.updatedAt : 'unknown'}`
    )
    if (doc.body) {
      log(`\nContent:\n${doc.body}`)
    }
    log('')
  }

  if (result.errors.length === 0) {
    return
  }

  warn('Some projects could not be searched:')
  for (const err of result.errors) {
    warn(`  - ${err}`)
  }
}
