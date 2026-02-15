import type {
  GetDaemonInfoRequest,
  DaemonInfo,
  GetNextIssueNumberRequest,
  GetNextIssueNumberResponse,
  ShutdownRequest,
  ShutdownResponse,
  RestartRequest,
  RestartResponse,
  OpenInTempWorkspaceResponse,
  OpenInTempWorkspaceWithEditorRequest,
  OpenStandaloneWorkspaceWithEditorRequest,
  OpenStandaloneWorkspaceResponse,
  OpenAgentInTerminalRequest,
  OpenAgentInTerminalResponse,
  ListTempWorkspacesRequest,
  ListTempWorkspacesResponse,
  CloseTempWorkspaceRequest,
  CloseTempWorkspaceResponse,
  CleanupExpiredWorkspacesRequest,
  CleanupExpiredWorkspacesResponse,
  GetEntityActionsRequest,
  GetEntityActionsResponse,
  ListSyncConflictsRequest,
  ListSyncConflictsResponse,
  GetSyncConflictRequest,
  GetSyncConflictResponse,
  ResolveSyncConflictRequest,
  ResolveSyncConflictResponse,
  GetSyncStatusRequest,
  GetSyncStatusResponse,
  SyncPullRequest,
  SyncPullResponse,
  SyncPushRequest,
  SyncPushResponse,
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for daemon info, workspace, entity, and sync operations
 */
export interface CentyDaemonExtendedClient {
  getDaemonInfo: GrpcMethod<GetDaemonInfoRequest, DaemonInfo>
  getNextIssueNumber: GrpcMethod<
    GetNextIssueNumberRequest,
    GetNextIssueNumberResponse
  >
  shutdown: GrpcMethod<ShutdownRequest, ShutdownResponse>
  restart: GrpcMethod<RestartRequest, RestartResponse>
  openInTempWorkspace: GrpcMethod<
    OpenInTempWorkspaceWithEditorRequest,
    OpenInTempWorkspaceResponse
  >
  openStandaloneWorkspace: GrpcMethod<
    OpenStandaloneWorkspaceWithEditorRequest,
    OpenStandaloneWorkspaceResponse
  >
  openAgentInTerminal: GrpcMethod<
    OpenAgentInTerminalRequest,
    OpenAgentInTerminalResponse
  >
  listTempWorkspaces: GrpcMethod<
    ListTempWorkspacesRequest,
    ListTempWorkspacesResponse
  >
  closeTempWorkspace: GrpcMethod<
    CloseTempWorkspaceRequest,
    CloseTempWorkspaceResponse
  >
  cleanupExpiredWorkspaces: GrpcMethod<
    CleanupExpiredWorkspacesRequest,
    CleanupExpiredWorkspacesResponse
  >
  getEntityActions: GrpcMethod<
    GetEntityActionsRequest,
    GetEntityActionsResponse
  >
  listSyncConflicts: GrpcMethod<
    ListSyncConflictsRequest,
    ListSyncConflictsResponse
  >
  getSyncConflict: GrpcMethod<GetSyncConflictRequest, GetSyncConflictResponse>
  resolveSyncConflict: GrpcMethod<
    ResolveSyncConflictRequest,
    ResolveSyncConflictResponse
  >
  getSyncStatus: GrpcMethod<GetSyncStatusRequest, GetSyncStatusResponse>
  syncPull: GrpcMethod<SyncPullRequest, SyncPullResponse>
  syncPush: GrpcMethod<SyncPushRequest, SyncPushResponse>
}
