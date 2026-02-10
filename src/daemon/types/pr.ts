/* eslint-disable single-export/single-export */
/**
 * Core pull request types for daemon gRPC communication.
 */

import type { Manifest } from './init.js'

export interface CreatePrRequest {
  projectPath: string
  title: string
  description: string
  sourceBranch?: string
  targetBranch?: string
  reviewers: string[]
  priority: number // 1 = highest priority, 0 = use default
  status: string
  customFields: Record<string, string>
  template?: string
}

export interface CreatePrResponse {
  success: boolean
  error: string
  id: string
  displayNumber: number
  createdFiles: string[]
  manifest?: Manifest
  detectedSourceBranch: string
}

export interface GetNextPrNumberRequest {
  projectPath: string
}

export interface GetNextPrNumberResponse {
  nextNumber: number
}

export interface PullRequest {
  id: string
  displayNumber: number
  title: string
  description: string
  metadata: PrMetadata
}

export interface PrMetadata {
  displayNumber: number
  status: string
  sourceBranch: string
  targetBranch: string
  reviewers: string[]
  priority: number
  priorityLabel: string
  createdAt: string
  updatedAt: string
  mergedAt: string
  closedAt: string
  customFields: Record<string, string>
  deletedAt: string
}

export interface GetPrRequest {
  projectPath: string
  prId: string
}

export interface GetPrByDisplayNumberRequest {
  projectPath: string
  displayNumber: number
}

export interface GetPrResponse {
  success: boolean
  error: string
  pr?: PullRequest
}

export interface ListPrsRequest {
  projectPath: string
  status?: string
  sourceBranch?: string
  targetBranch?: string
  priority?: number
  includeDeleted?: boolean
}

export interface ListPrsResponse {
  prs: PullRequest[]
  totalCount: number
}
