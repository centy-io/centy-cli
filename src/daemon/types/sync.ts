/* eslint-disable single-export/single-export */
/**
 * Sync types for daemon gRPC communication.
 */

export interface SyncConflict {
  id: string
  itemType: string
  itemId: string
  filePath: string
  createdAt: string
  description: string
  baseContent: string
  oursContent: string
  theirsContent: string
}

export interface ListSyncConflictsRequest {
  projectPath: string
}

export interface ListSyncConflictsResponse {
  conflicts: SyncConflict[]
  success: boolean
  error: string
}

export interface GetSyncConflictRequest {
  projectPath: string
  conflictId: string
}

export interface GetSyncConflictResponse {
  conflict?: SyncConflict
  success: boolean
  error: string
}

export interface ResolveSyncConflictRequest {
  projectPath: string
  conflictId: string
  resolution: string
  mergedContent?: string
}

export interface ResolveSyncConflictResponse {
  success: boolean
  error: string
}

export interface GetSyncStatusRequest {
  projectPath: string
}

export interface GetSyncStatusResponse {
  mode: string
  hasPendingChanges: boolean
  hasPendingPush: boolean
  conflictCount: number
  lastSyncTime: string
  success: boolean
  error: string
}

export interface SyncPullRequest {
  projectPath: string
}

export interface SyncPullResponse {
  success: boolean
  error: string
  hadChanges: boolean
  conflictFiles: string[]
}

export interface SyncPushRequest {
  projectPath: string
  commitMessage?: string
}

export interface SyncPushResponse {
  success: boolean
  error: string
  hadChanges: boolean
}
