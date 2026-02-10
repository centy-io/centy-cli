/* eslint-disable single-export/single-export */
/**
 * Initialization and manifest types for daemon gRPC communication.
 */

import type { OrgInferenceResult } from './organization.js'

export interface InitRequest {
  projectPath: string
  force: boolean
  decisions?: ReconciliationDecisions
}

export interface InitResponse {
  success: boolean
  error: string
  created: string[]
  restored: string[]
  reset: string[]
  skipped: string[]
  manifest?: Manifest
  orgInference?: OrgInferenceResult
}

export interface GetReconciliationPlanRequest {
  projectPath: string
}

export interface ReconciliationPlan {
  toCreate: FileInfo[]
  toRestore: FileInfo[]
  toReset: FileInfo[]
  upToDate: FileInfo[]
  userFiles: FileInfo[]
  needsDecisions: boolean
}

export interface ExecuteReconciliationRequest {
  projectPath: string
  decisions?: ReconciliationDecisions
}

export interface ReconciliationDecisions {
  restore: string[]
  reset: string[]
}

export interface FileInfo {
  path: string
  fileType: 'FILE_TYPE_UNSPECIFIED' | 'FILE_TYPE_FILE' | 'FILE_TYPE_DIRECTORY'
  hash: string
  contentPreview: string
}

export interface Manifest {
  schemaVersion: number
  centyVersion: string
  createdAt: string
  updatedAt: string
}

export interface IsInitializedRequest {
  projectPath: string
}

export interface IsInitializedResponse {
  initialized: boolean
  centyPath: string
}

export interface GetManifestRequest {
  projectPath: string
}

export interface GetManifestResponse {
  success: boolean
  error: string
  manifest?: Manifest
}
