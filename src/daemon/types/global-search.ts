/* eslint-disable single-export/single-export */
/**
 * Types for cross-project global item search (CLI-side only).
 */

import type { GenericItem } from '../generated/centy/v1/generic_item.js'

export interface ItemWithProjectInfo {
  item: GenericItem
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GlobalItemSearchResult {
  items: ItemWithProjectInfo[]
  errors: string[]
}
