/* eslint-disable single-export/single-export */
/**
 * Generic item types for daemon gRPC communication.
 */

export interface GenericItem {
  id: string
  itemType: string
  title: string
  body: string
  metadata?: GenericItemMetadata
}

export interface GenericItemMetadata {
  displayNumber: number
  status: string
  priority: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  customFields: Record<string, string>
}

export interface CreateItemRequest {
  projectPath: string
  itemType: string
  title: string
  body: string
  status: string
  priority: number
  customFields: Record<string, string>
}

export interface CreateItemResponse {
  success: boolean
  error: string
  item?: GenericItem
}

export interface GetItemRequest {
  projectPath: string
  itemType: string
  itemId: string
}

export interface GetItemResponse {
  success: boolean
  error: string
  item?: GenericItem
}

export interface ListItemsRequest {
  projectPath: string
  itemType: string
  status?: string
  priority?: number
  includeDeleted?: boolean
  limit?: number
  offset?: number
}

export interface ListItemsResponse {
  success: boolean
  error: string
  items: GenericItem[]
  totalCount: number
}

export interface UpdateItemRequest {
  projectPath: string
  itemType: string
  itemId: string
  title?: string
  body?: string
  status?: string
  priority?: number
  customFields?: Record<string, string>
}

export interface UpdateItemResponse {
  success: boolean
  error: string
  item?: GenericItem
}

export interface DeleteItemRequest {
  projectPath: string
  itemType: string
  itemId: string
  force?: boolean
}

export interface DeleteItemResponse {
  success: boolean
  error: string
}

export interface SoftDeleteItemRequest {
  projectPath: string
  itemType: string
  itemId: string
}

export interface SoftDeleteItemResponse {
  success: boolean
  error: string
  item?: GenericItem
}

export interface RestoreItemRequest {
  projectPath: string
  itemType: string
  itemId: string
}

export interface RestoreItemResponse {
  success: boolean
  error: string
  item?: GenericItem
}
