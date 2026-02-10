/* eslint-disable single-export/single-export */
/**
 * Document lifecycle (soft delete, restore, move, duplicate) types
 * for daemon gRPC communication.
 */

import type { Manifest } from './init.js'
import type { Doc } from './doc.js'

export interface SoftDeleteDocRequest {
  projectPath: string
  slug: string
}

export interface SoftDeleteDocResponse {
  success: boolean
  error: string
  doc?: Doc
  manifest?: Manifest
}

export interface RestoreDocRequest {
  projectPath: string
  slug: string
}

export interface RestoreDocResponse {
  success: boolean
  error: string
  doc?: Doc
  manifest?: Manifest
}

export interface MoveDocRequest {
  sourceProjectPath: string
  slug: string
  targetProjectPath: string
  newSlug?: string
}

export interface MoveDocResponse {
  success: boolean
  error: string
  doc: Doc
  oldSlug: string
  sourceManifest?: Manifest
  targetManifest?: Manifest
}

export interface DuplicateDocRequest {
  sourceProjectPath: string
  slug: string
  targetProjectPath: string
  newSlug?: string
  newTitle?: string
}

export interface DuplicateDocResponse {
  success: boolean
  error: string
  doc: Doc
  originalSlug: string
  manifest?: Manifest
}
