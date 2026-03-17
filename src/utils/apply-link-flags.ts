import { daemonCreateLink } from '../daemon/daemon-create-link.js'
import { LinkTargetType } from '../daemon/types.js'
import { parseLinkTarget } from './parse-link-target.js'

interface Logger {
  log(msg: string): void
  warn(msg: string): void
}

/**
 * Process --link flag specs and create links for a newly created/updated item.
 */
export async function applyLinkFlags(
  linkSpecs: string[],
  sourceId: string,
  sourceType: string,
  projectPath: string,
  logger: Logger
): Promise<void> {
  for (const linkSpec of linkSpecs) {
    const colonIdx = linkSpec.indexOf(':')
    if (colonIdx === -1) {
      logger.warn(
        `Invalid link format "${linkSpec}" — expected link-type:type:id`
      )
      continue
    }
    const linkType = linkSpec.slice(0, colonIdx)
    const parsed = parseLinkTarget(linkSpec.slice(colonIdx + 1))
    if (parsed === undefined) {
      logger.warn(`Invalid link target in "${linkSpec}" — expected type:id`)
      continue
    }
    const linkResp = await daemonCreateLink({
      projectPath,
      sourceId,
      // eslint-disable-next-line no-restricted-syntax
      sourceType: sourceType as LinkTargetType,
      targetId: parsed[1],
      // eslint-disable-next-line no-restricted-syntax
      targetType: parsed[0] as LinkTargetType,
      linkType,
    })
    if (!linkResp.success) {
      logger.warn(`Failed to create link "${linkSpec}": ${linkResp.error}`)
    } else {
      logger.log(
        `  Linked: ${sourceType} --[${linkType}]--> ${parsed[0]}:${parsed[1]}`
      )
    }
  }
}
