/* eslint-disable single-export/single-export */
/**
 * Core issue types for daemon gRPC communication.
 */

import type { Manifest } from './init.js'
import type { OrgDocSyncResult } from './doc.js'

export interface CreateIssueRequest {
  projectPath: string
  title: string
  description: string
  priority: number // 1 = highest priority, 0 = use default
  status: string
  customFields: Record<string, string>
  template?: string
  draft?: boolean
  isOrgIssue?: boolean
}

export interface CreateIssueResponse {
  success: boolean
  error: string
  id: string
  displayNumber: number
  issueNumber: string
  createdFiles: string[]
  manifest?: Manifest
  orgDisplayNumber?: number
  syncResults?: OrgDocSyncResult[]
}

export interface GetNextIssueNumberRequest {
  projectPath: string
}

export interface GetNextIssueNumberResponse {
  issueNumber: string
}

export interface Issue {
  id: string
  displayNumber: number
  issueNumber: string
  title: string
  description: string
  metadata: IssueMetadata
}

export interface IssueMetadata {
  displayNumber: number
  status: string
  priority: number
  createdAt: string
  updatedAt: string
  customFields: Record<string, string>
  priorityLabel: string
  draft: boolean
  deletedAt: string
  isOrgIssue: boolean
  orgSlug: string
  orgDisplayNumber: number
}

export interface GetIssueRequest {
  projectPath: string
  issueId: string
}

export interface GetIssueByDisplayNumberRequest {
  projectPath: string
  displayNumber: number
}

export interface GetIssueResponse {
  success: boolean
  error: string
  issue?: Issue
}

export interface ListIssuesRequest {
  projectPath: string
  status?: string
  priority?: number
  draft?: boolean
  includeDeleted?: boolean
}

export interface ListIssuesResponse {
  issues: Issue[]
  totalCount: number
}

export interface UpdateIssueRequest {
  projectPath: string
  issueId: string
  title?: string
  description?: string
  status?: string
  priority?: number
  customFields?: Record<string, string>
  draft?: boolean
}

export interface UpdateIssueResponse {
  success: boolean
  error: string
  issue: Issue
  manifest?: Manifest
  syncResults?: OrgDocSyncResult[]
}
