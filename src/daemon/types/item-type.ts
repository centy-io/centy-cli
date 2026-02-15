/* eslint-disable single-export/single-export */
/**
 * Item type types for daemon gRPC communication.
 */

export interface ItemTypeCustomField {
  name: string
  fieldType: string
  required: boolean
  defaultValue: string
  enumValues: string[]
}

export interface CreateItemTypeRequest {
  projectPath: string
  name: string
  plural: string
  identifier: string
  features: string[]
  statuses: string[]
  defaultStatus: string
  priorityLevels: number
  customFields: ItemTypeCustomField[]
}

export interface CreateItemTypeResponse {
  success: boolean
  error: string
  itemType?: ItemTypeConfig
}

export interface ItemTypeConfig {
  name: string
  plural: string
  identifier: string
  features: string[]
  statuses: string[]
  defaultStatus: string
  priorityLevels: number
  customFields: ItemTypeCustomField[]
}
