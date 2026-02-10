/* eslint-disable single-export/single-export */
/**
 * Link types for daemon gRPC communication.
 */

export interface Link {
  targetId: string
  targetType: string
  linkType: string
  createdAt: string
}

export interface CreateLinkRequest {
  projectPath: string
  sourceId: string
  sourceType: string
  targetId: string
  targetType: string
  linkType: string
}

export interface CreateLinkResponse {
  success: boolean
  error: string
  createdLink?: Link
  inverseLink?: Link
}

export interface DeleteLinkRequest {
  projectPath: string
  sourceId: string
  sourceType: string
  targetId: string
  targetType: string
  linkType?: string
}

export interface DeleteLinkResponse {
  success: boolean
  error: string
  deletedCount: number
}

export interface ListLinksRequest {
  projectPath: string
  entityId: string
  entityType: string
}

export interface ListLinksResponse {
  links: Link[]
  totalCount: number
}

export interface GetAvailableLinkTypesRequest {
  projectPath: string
}

export interface LinkTypeInfo {
  name: string
  inverse: string
  description: string
  isBuiltin: boolean
}

export interface GetAvailableLinkTypesResponse {
  linkTypes: LinkTypeInfo[]
}
