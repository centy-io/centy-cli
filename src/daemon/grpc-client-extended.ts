import type {
  GetDaemonInfoRequest,
  DaemonInfo,
  GetNextIssueNumberRequest,
  GetNextIssueNumberResponse,
  ShutdownRequest,
  ShutdownResponse,
  RestartRequest,
  RestartResponse,
  OpenInTempWorkspaceRequest,
  OpenInTempWorkspaceResponse,
  OpenInTempWorkspaceWithEditorRequest,
  OpenStandaloneWorkspaceWithEditorRequest,
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
  CreateLinkRequest,
  CreateLinkResponse,
  DeleteLinkRequest,
  DeleteLinkResponse,
  ListLinksRequest,
  ListLinksResponse,
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for daemon info, workspace, entity, sync, and link operations
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
    OpenInTempWorkspaceRequest,
    OpenInTempWorkspaceResponse
  >
  openInTempWorkspaceWithEditor: GrpcMethod<
    OpenInTempWorkspaceWithEditorRequest,
    OpenInTempWorkspaceResponse
  >
  openStandaloneWorkspaceWithEditor: GrpcMethod<
    OpenStandaloneWorkspaceWithEditorRequest,
    OpenInTempWorkspaceResponse
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
  createLink: GrpcMethod<CreateLinkRequest, CreateLinkResponse>
  deleteLink: GrpcMethod<DeleteLinkRequest, DeleteLinkResponse>
  listLinks: GrpcMethod<ListLinksRequest, ListLinksResponse>
}
