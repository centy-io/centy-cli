import type { Doc } from '../../daemon/types.js'

export function formatDocPlain(doc: Doc, log: (msg: string) => void): void {
  log(`Title: ${doc.title}`)
  log(`Slug: ${doc.slug}`)
  log(
    `Created: ${doc.metadata !== undefined ? doc.metadata.createdAt : 'unknown'}`
  )
  log(
    `Updated: ${doc.metadata !== undefined ? doc.metadata.updatedAt : 'unknown'}`
  )
  log(`\nContent:\n${doc.content}`)
}
