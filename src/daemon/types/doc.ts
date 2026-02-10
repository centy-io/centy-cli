/* eslint-disable single-export/single-export */
/**
 * Document types for daemon gRPC communication.
 */

import type { Manifest } from './init.js'

export interface OrgDocSyncResult {
  projectPath: string
  success: boolean
  error: string
}

export interface Doc {
  slug: string
  title: string
  content: string
  metadata: DocMetadata
}

export interface DocMetadata {
  createdAt: string
  updatedAt: string
  deletedAt: string
  isOrgDoc: boolean
  orgSlug: string
}

export interface CreateDocRequest {
  projectPath: string
  title: string
  content: string
  slug?: string
  template?: string
  isOrgDoc?: boolean
}

export interface CreateDocResponse {
  success: boolean
  error: string
  slug: string
  createdFile: string
  manifest?: Manifest
  syncResults?: OrgDocSyncResult[]
}

export interface GetDocRequest {
  projectPath: string
  slug: string
}

export interface GetDocResponse {
  success: boolean
  error: string
  doc?: Doc
}

export interface GetDocsBySlugRequest {
  slug: string
}

export interface DocWithProject {
  doc: Doc
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GetDocsBySlugResponse {
  docs: DocWithProject[]
  totalCount: number
  errors: string[]
}

export interface ListDocsRequest {
  projectPath: string
  includeDeleted?: boolean
}

export interface ListDocsResponse {
  docs: Doc[]
  totalCount: number
}

export interface UpdateDocRequest {
  projectPath: string
  slug: string
  title?: string
  content?: string
  newSlug?: string
}

export interface UpdateDocResponse {
  success: boolean
  error: string
  doc: Doc
  manifest?: Manifest
  syncResults?: OrgDocSyncResult[]
}

export interface DeleteDocRequest {
  projectPath: string
  slug: string
}

export interface DeleteDocResponse {
  success: boolean
  error: string
  manifest?: Manifest
}
