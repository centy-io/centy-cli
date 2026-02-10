/* eslint-disable single-export/single-export */
/**
 * Pull request lifecycle (update, delete, soft delete, restore) types
 * for daemon gRPC communication.
 */

import type { Manifest } from './init.js'
import type { PullRequest } from './pr.js'

export interface UpdatePrRequest {
  projectPath: string
  prId: string
  title?: string
  description?: string
  status?: string
  sourceBranch?: string
  targetBranch?: string
  reviewers?: string[]
  priority?: number
  customFields?: Record<string, string>
}

export interface UpdatePrResponse {
  success: boolean
  error: string
  pr: PullRequest
  manifest?: Manifest
}

export interface DeletePrRequest {
  projectPath: string
  prId: string
}

export interface DeletePrResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

export interface SoftDeletePrRequest {
  projectPath: string
  prId: string
}

export interface SoftDeletePrResponse {
  success: boolean
  error: string
  pr?: PullRequest
  manifest?: Manifest
}

export interface RestorePrRequest {
  projectPath: string
  prId: string
}

export interface RestorePrResponse {
  success: boolean
  error: string
  pr?: PullRequest
  manifest?: Manifest
}
