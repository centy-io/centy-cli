/* eslint-disable single-export/single-export */
/**
 * Issue lifecycle (soft delete, restore, move, duplicate) types
 * for daemon gRPC communication.
 */

import type { Manifest } from './init.js'
import type { Issue } from './issue.js'

export interface DeleteIssueRequest {
  projectPath: string
  issueId: string
}

export interface DeleteIssueResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

export interface SoftDeleteIssueRequest {
  projectPath: string
  issueId: string
}

export interface SoftDeleteIssueResponse {
  success: boolean
  error: string
  issue?: Issue
  manifest?: Manifest
}

export interface RestoreIssueRequest {
  projectPath: string
  issueId: string
}

export interface RestoreIssueResponse {
  success: boolean
  error: string
  issue?: Issue
  manifest?: Manifest
}

export interface MoveIssueRequest {
  sourceProjectPath: string
  issueId: string
  targetProjectPath: string
}

export interface MoveIssueResponse {
  success: boolean
  error: string
  issue: Issue
  oldDisplayNumber: number
  sourceManifest?: Manifest
  targetManifest?: Manifest
}

export interface DuplicateIssueRequest {
  sourceProjectPath: string
  issueId: string
  targetProjectPath: string
  newTitle?: string
}

export interface DuplicateIssueResponse {
  success: boolean
  error: string
  issue: Issue
  originalIssueId: string
  manifest?: Manifest
}
