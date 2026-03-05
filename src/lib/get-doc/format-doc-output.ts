import type { GenericItem } from '../../daemon/types.js'

export function formatDocPlain(
  doc: GenericItem,
  log: (msg: string) => void
): void {
  log(`Title: ${doc.title}`)
  log(`Slug: ${doc.id}`)
  log(
    `Created: ${doc.metadata !== undefined ? doc.metadata.createdAt : 'unknown'}`
  )
  log(
    `Updated: ${doc.metadata !== undefined ? doc.metadata.updatedAt : 'unknown'}`
  )
  log(`\nContent:\n${doc.body}`)
}
