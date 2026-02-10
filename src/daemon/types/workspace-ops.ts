/* eslint-disable single-export/single-export */
/**
 * Workspace operations (standalone, temp listing, cleanup) types
 * for daemon gRPC communication.
 */

export interface OpenStandaloneWorkspaceRequest {
  projectPath: string
  name?: string
  description?: string
  ttlHours?: number
  agentName?: string
}

export interface OpenStandaloneWorkspaceResponse {
  success: boolean
  error: string
  workspacePath: string
  workspaceId: string
  name: string
  expiresAt: string
  editorOpened: boolean
  workspaceReused: boolean
  originalCreatedAt: string
}

export interface TempWorkspace {
  workspacePath: string
  sourceProjectPath: string
  issueId: string
  issueDisplayNumber: number
  issueTitle: string
  agentName: string
  action: string
  createdAt: string
  expiresAt: string
  isStandalone: boolean
  workspaceId: string
  workspaceName: string
  workspaceDescription: string
}

export interface ListTempWorkspacesRequest {
  includeExpired?: boolean
  sourceProjectPath?: string
}

export interface ListTempWorkspacesResponse {
  workspaces: TempWorkspace[]
  totalCount: number
  expiredCount: number
}

export interface CloseTempWorkspaceRequest {
  workspacePath: string
  force?: boolean
}

export interface CloseTempWorkspaceResponse {
  success: boolean
  error: string
  worktreeRemoved: boolean
  directoryRemoved: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CleanupExpiredWorkspacesRequest {}

export interface CleanupExpiredWorkspacesResponse {
  success: boolean
  error: string
  cleanedCount: number
  cleanedPaths: string[]
  failedPaths: string[]
}
