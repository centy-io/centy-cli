/* eslint-disable single-export/single-export */
/**
 * Feature types (CLI-side only, not in daemon) for gRPC communication.
 */

import type { Issue } from '../generated/centy/v1/centy.js'

export interface GetFeatureStatusRequest {
  projectPath: string
}

export interface GetFeatureStatusResponse {
  initialized: boolean
  hasCompact: boolean
  hasInstruction: boolean
  uncompactedCount: number
}

export interface ListUncompactedIssuesRequest {
  projectPath: string
}

export interface ListUncompactedIssuesResponse {
  issues: Issue[]
  totalCount: number
}

export interface GetInstructionRequest {
  projectPath: string
}

export interface GetInstructionResponse {
  content: string
}

export interface GetCompactRequest {
  projectPath: string
}

export interface GetCompactResponse {
  exists: boolean
  content: string
}

export interface UpdateCompactRequest {
  projectPath: string
  content: string
}

export interface UpdateCompactResponse {
  success: boolean
  error: string
}

export interface SaveMigrationRequest {
  projectPath: string
  content: string
}

export interface SaveMigrationResponse {
  success: boolean
  error: string
  filename: string
  path: string
}

export interface MarkIssuesCompactedRequest {
  projectPath: string
  issueIds: string[]
}

export interface MarkIssuesCompactedResponse {
  success: boolean
  error: string
  markedCount: number
}
