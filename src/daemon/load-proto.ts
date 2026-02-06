/* eslint-disable max-lines */
/* eslint-disable single-export/single-export */
/* eslint-disable default/no-default-params */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPackageDefinition, credentials, status } from '@grpc/grpc-js'
import type { ServiceError, ChannelOptions, CallOptions } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import type {
  InitRequest,
  InitResponse,
  GetReconciliationPlanRequest,
  ReconciliationPlan,
  ExecuteReconciliationRequest,
  IsInitializedRequest,
  IsInitializedResponse,
  CreateIssueRequest,
  CreateIssueResponse,
  GetManifestRequest,
  GetManifestResponse,
  GetConfigRequest,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  GetIssueRequest,
  GetIssueByDisplayNumberRequest,
  GetIssuesByUuidRequest,
  GetIssuesByUuidResponse,
  GetIssueResponse,
  ListIssuesRequest,
  ListIssuesResponse,
  UpdateIssueRequest,
  UpdateIssueResponse,
  DeleteIssueRequest,
  DeleteIssueResponse,
  SoftDeleteIssueRequest,
  SoftDeleteIssueResponse,
  RestoreIssueRequest,
  RestoreIssueResponse,
  MoveIssueRequest,
  MoveIssueResponse,
  DuplicateIssueRequest,
  DuplicateIssueResponse,
  CreateDocRequest,
  CreateDocResponse,
  GetDocRequest,
  GetDocsBySlugRequest,
  GetDocsBySlugResponse,
  GetDocResponse,
  ListDocsRequest,
  ListDocsResponse,
  UpdateDocRequest,
  UpdateDocResponse,
  DeleteDocRequest,
  DeleteDocResponse,
  SoftDeleteDocRequest,
  SoftDeleteDocResponse,
  RestoreDocRequest,
  RestoreDocResponse,
  MoveDocRequest,
  MoveDocResponse,
  DuplicateDocRequest,
  DuplicateDocResponse,
  AddAssetRequest,
  AddAssetResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  GetAssetRequest,
  GetAssetResponse,
  DeleteAssetRequest,
  DeleteAssetResponse,
  ListSharedAssetsRequest,
  ListProjectsRequest,
  ListProjectsResponse,
  RegisterProjectRequest,
  RegisterProjectResponse,
  UntrackProjectRequest,
  UntrackProjectResponse,
  GetProjectInfoRequest,
  GetProjectInfoResponse,
  SetProjectFavoriteRequest,
  SetProjectFavoriteResponse,
  SetProjectArchivedRequest,
  SetProjectArchivedResponse,
  GetDaemonInfoRequest,
  DaemonInfo,
  GetNextIssueNumberRequest,
  GetNextIssueNumberResponse,
  ShutdownRequest,
  ShutdownResponse,
  RestartRequest,
  RestartResponse,
  CreatePrRequest,
  CreatePrResponse,
  GetPrRequest,
  GetPrByDisplayNumberRequest,
  GetPrsByUuidRequest,
  GetPrsByUuidResponse,
  GetPrResponse,
  ListPrsRequest,
  ListPrsResponse,
  UpdatePrRequest,
  UpdatePrResponse,
  DeletePrRequest,
  DeletePrResponse,
  SoftDeletePrRequest,
  SoftDeletePrResponse,
  RestorePrRequest,
  RestorePrResponse,
  GetNextPrNumberRequest,
  GetNextPrNumberResponse,
  GetFeatureStatusRequest,
  GetFeatureStatusResponse,
  ListUncompactedIssuesRequest,
  ListUncompactedIssuesResponse,
  GetInstructionRequest,
  GetInstructionResponse,
  GetCompactRequest,
  GetCompactResponse,
  UpdateCompactRequest,
  UpdateCompactResponse,
  SaveMigrationRequest,
  SaveMigrationResponse,
  MarkIssuesCompactedRequest,
  MarkIssuesCompactedResponse,
  SetProjectOrganizationRequest,
  SetProjectOrganizationResponse,
  SetProjectUserTitleRequest,
  SetProjectUserTitleResponse,
  SetProjectTitleRequest,
  SetProjectTitleResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  ListOrganizationsRequest,
  ListOrganizationsResponse,
  GetOrganizationRequest,
  GetOrganizationResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
  DeleteOrganizationRequest,
  DeleteOrganizationResponse,
  CreateUserRequest,
  CreateUserResponse,
  GetUserRequest,
  GetUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  SoftDeleteUserRequest,
  SoftDeleteUserResponse,
  RestoreUserRequest,
  RestoreUserResponse,
  SyncUsersRequest,
  SyncUsersResponse,
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
  CreateLinkRequest,
  CreateLinkResponse,
  DeleteLinkRequest,
  DeleteLinkResponse,
  ListLinksRequest,
  ListLinksResponse,
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

/**
 * Default timeout for gRPC calls in milliseconds (30 seconds)
 */
export const DEFAULT_GRPC_TIMEOUT_MS = 30_000

/**
 * Timeout for long-running operations like init/compact (2 minutes)
 */
export const LONG_GRPC_TIMEOUT_MS = 120_000

/**
 * Channel options for gRPC connection management
 */
const CHANNEL_OPTIONS: ChannelOptions = {
  // Initial connection timeout (10 seconds)
  'grpc.initial_reconnect_backoff_ms': 1000,
  'grpc.max_reconnect_backoff_ms': 10000,
  // Keepalive settings
  'grpc.keepalive_time_ms': 30000,
  'grpc.keepalive_timeout_ms': 10000,
  'grpc.keepalive_permit_without_calls': 1,
  // Connection management
  'grpc.max_connection_idle_ms': 60000,
  'grpc.max_connection_age_ms': 300000,
  // Enable HTTP/2 true binary
  'grpc.http2.true_binary': 1,
}

/**
 * Create call options with a deadline
 */
export function createCallOptions(
  timeoutMs: number = DEFAULT_GRPC_TIMEOUT_MS
): CallOptions {
  return {
    deadline: new Date(Date.now() + timeoutMs),
  }
}

/**
 * Error class for gRPC deadline exceeded
 */
export class GrpcTimeoutError extends Error {
  constructor(methodName: string, timeoutMs: number) {
    super(
      `gRPC call '${methodName}' timed out after ${timeoutMs}ms. The daemon may not be responding.`
    )
    this.name = 'GrpcTimeoutError'
  }
}

/**
 * Check if an error is a deadline exceeded error
 */
export function isDeadlineExceededError(error: ServiceError): boolean {
  return error.code === status.DEADLINE_EXCEEDED
}

/**
 * Check if an error indicates the daemon is unavailable
 */
export function isDaemonUnavailableError(error: ServiceError): boolean {
  return (
    error.code === status.UNAVAILABLE ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('UNAVAILABLE')
  )
}

const currentDir = dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = join(currentDir, '../../proto/centy.proto')

const DEFAULT_DAEMON_ADDRESS = '127.0.0.1:50051'

/**
 * gRPC method type that supports options
 */
type GrpcMethod<Req, Res> = {
  (
    request: Req,
    callback: (error: ServiceError | null, response: Res) => void
  ): void
  (
    request: Req,
    options: CallOptions,
    callback: (error: ServiceError | null, response: Res) => void
  ): void
}

/**
 * Generic wrapper for gRPC calls with deadline support
 * This ensures all calls have a timeout and won't hang forever
 */
export function callWithDeadline<Req, Res>(
  method: GrpcMethod<Req, Res>,
  request: Req,
  timeoutMs: number = DEFAULT_GRPC_TIMEOUT_MS
): Promise<Res> {
  return new Promise((resolve, reject) => {
    const options = createCallOptions(timeoutMs)
    method(request, options, (error: ServiceError | null, response: Res) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}

interface CentyDaemonClient {
  // Init operations
  init: GrpcMethod<InitRequest, InitResponse>
  getReconciliationPlan: GrpcMethod<
    GetReconciliationPlanRequest,
    ReconciliationPlan
  >
  executeReconciliation: GrpcMethod<ExecuteReconciliationRequest, InitResponse>
  isInitialized: GrpcMethod<IsInitializedRequest, IsInitializedResponse>

  // Issue operations
  createIssue: GrpcMethod<CreateIssueRequest, CreateIssueResponse>
  getIssue: GrpcMethod<GetIssueRequest, GetIssueResponse>
  getIssueByDisplayNumber: GrpcMethod<
    GetIssueByDisplayNumberRequest,
    GetIssueResponse
  >
  getIssuesByUuid: GrpcMethod<GetIssuesByUuidRequest, GetIssuesByUuidResponse>
  listIssues: GrpcMethod<ListIssuesRequest, ListIssuesResponse>
  updateIssue: GrpcMethod<UpdateIssueRequest, UpdateIssueResponse>
  deleteIssue: GrpcMethod<DeleteIssueRequest, DeleteIssueResponse>
  softDeleteIssue: GrpcMethod<SoftDeleteIssueRequest, SoftDeleteIssueResponse>
  restoreIssue: GrpcMethod<RestoreIssueRequest, RestoreIssueResponse>
  moveIssue: GrpcMethod<MoveIssueRequest, MoveIssueResponse>
  duplicateIssue: GrpcMethod<DuplicateIssueRequest, DuplicateIssueResponse>

  // Manifest and Config
  getManifest: GrpcMethod<GetManifestRequest, GetManifestResponse>
  getConfig: GrpcMethod<GetConfigRequest, GetConfigResponse>
  updateConfig: GrpcMethod<UpdateConfigRequest, UpdateConfigResponse>

  // Doc operations
  createDoc: GrpcMethod<CreateDocRequest, CreateDocResponse>
  getDoc: GrpcMethod<GetDocRequest, GetDocResponse>
  getDocsBySlug: GrpcMethod<GetDocsBySlugRequest, GetDocsBySlugResponse>
  listDocs: GrpcMethod<ListDocsRequest, ListDocsResponse>
  updateDoc: GrpcMethod<UpdateDocRequest, UpdateDocResponse>
  deleteDoc: GrpcMethod<DeleteDocRequest, DeleteDocResponse>
  softDeleteDoc: GrpcMethod<SoftDeleteDocRequest, SoftDeleteDocResponse>
  restoreDoc: GrpcMethod<RestoreDocRequest, RestoreDocResponse>
  moveDoc: GrpcMethod<MoveDocRequest, MoveDocResponse>
  duplicateDoc: GrpcMethod<DuplicateDocRequest, DuplicateDocResponse>

  // Asset operations
  addAsset: GrpcMethod<AddAssetRequest, AddAssetResponse>
  listAssets: GrpcMethod<ListAssetsRequest, ListAssetsResponse>
  getAsset: GrpcMethod<GetAssetRequest, GetAssetResponse>
  deleteAsset: GrpcMethod<DeleteAssetRequest, DeleteAssetResponse>
  listSharedAssets: GrpcMethod<ListSharedAssetsRequest, ListAssetsResponse>

  // Project registry operations
  listProjects: GrpcMethod<ListProjectsRequest, ListProjectsResponse>
  registerProject: GrpcMethod<RegisterProjectRequest, RegisterProjectResponse>
  untrackProject: GrpcMethod<UntrackProjectRequest, UntrackProjectResponse>
  getProjectInfo: GrpcMethod<GetProjectInfoRequest, GetProjectInfoResponse>
  setProjectFavorite: GrpcMethod<
    SetProjectFavoriteRequest,
    SetProjectFavoriteResponse
  >
  setProjectArchived: GrpcMethod<
    SetProjectArchivedRequest,
    SetProjectArchivedResponse
  >
  setProjectOrganization: GrpcMethod<
    SetProjectOrganizationRequest,
    SetProjectOrganizationResponse
  >
  setProjectUserTitle: GrpcMethod<
    SetProjectUserTitleRequest,
    SetProjectUserTitleResponse
  >
  setProjectTitle: GrpcMethod<SetProjectTitleRequest, SetProjectTitleResponse>

  // Organization operations
  createOrganization: GrpcMethod<
    CreateOrganizationRequest,
    CreateOrganizationResponse
  >
  listOrganizations: GrpcMethod<
    ListOrganizationsRequest,
    ListOrganizationsResponse
  >
  getOrganization: GrpcMethod<GetOrganizationRequest, GetOrganizationResponse>
  updateOrganization: GrpcMethod<
    UpdateOrganizationRequest,
    UpdateOrganizationResponse
  >
  deleteOrganization: GrpcMethod<
    DeleteOrganizationRequest,
    DeleteOrganizationResponse
  >

  // Version operations
  getDaemonInfo: GrpcMethod<GetDaemonInfoRequest, DaemonInfo>

  // Issue number
  getNextIssueNumber: GrpcMethod<
    GetNextIssueNumberRequest,
    GetNextIssueNumberResponse
  >

  // Daemon control operations
  shutdown: GrpcMethod<ShutdownRequest, ShutdownResponse>
  restart: GrpcMethod<RestartRequest, RestartResponse>

  // PR operations
  createPr: GrpcMethod<CreatePrRequest, CreatePrResponse>
  getPr: GrpcMethod<GetPrRequest, GetPrResponse>
  getPrByDisplayNumber: GrpcMethod<GetPrByDisplayNumberRequest, GetPrResponse>
  getPrsByUuid: GrpcMethod<GetPrsByUuidRequest, GetPrsByUuidResponse>
  listPrs: GrpcMethod<ListPrsRequest, ListPrsResponse>
  updatePr: GrpcMethod<UpdatePrRequest, UpdatePrResponse>
  deletePr: GrpcMethod<DeletePrRequest, DeletePrResponse>
  softDeletePr: GrpcMethod<SoftDeletePrRequest, SoftDeletePrResponse>
  restorePr: GrpcMethod<RestorePrRequest, RestorePrResponse>
  getNextPrNumber: GrpcMethod<GetNextPrNumberRequest, GetNextPrNumberResponse>

  // Features operations
  getFeatureStatus: GrpcMethod<
    GetFeatureStatusRequest,
    GetFeatureStatusResponse
  >
  listUncompactedIssues: GrpcMethod<
    ListUncompactedIssuesRequest,
    ListUncompactedIssuesResponse
  >
  getInstruction: GrpcMethod<GetInstructionRequest, GetInstructionResponse>
  getCompact: GrpcMethod<GetCompactRequest, GetCompactResponse>
  updateCompact: GrpcMethod<UpdateCompactRequest, UpdateCompactResponse>
  saveMigration: GrpcMethod<SaveMigrationRequest, SaveMigrationResponse>
  markIssuesCompacted: GrpcMethod<
    MarkIssuesCompactedRequest,
    MarkIssuesCompactedResponse
  >

  // User operations
  createUser: GrpcMethod<CreateUserRequest, CreateUserResponse>
  getUser: GrpcMethod<GetUserRequest, GetUserResponse>
  listUsers: GrpcMethod<ListUsersRequest, ListUsersResponse>
  updateUser: GrpcMethod<UpdateUserRequest, UpdateUserResponse>
  deleteUser: GrpcMethod<DeleteUserRequest, DeleteUserResponse>
  softDeleteUser: GrpcMethod<SoftDeleteUserRequest, SoftDeleteUserResponse>
  restoreUser: GrpcMethod<RestoreUserRequest, RestoreUserResponse>
  syncUsers: GrpcMethod<SyncUsersRequest, SyncUsersResponse>

  // Workspace operations
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

  // Entity actions
  getEntityActions: GrpcMethod<
    GetEntityActionsRequest,
    GetEntityActionsResponse
  >

  // Sync operations
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

  // Link operations
  createLink: GrpcMethod<CreateLinkRequest, CreateLinkResponse>
  deleteLink: GrpcMethod<DeleteLinkRequest, DeleteLinkResponse>
  listLinks: GrpcMethod<ListLinksRequest, ListLinksResponse>
}

interface ProtoDescriptor {
  centy: {
    v1: {
      CentyDaemon: new (
        address: string,
        creds: ReturnType<typeof credentials.createInsecure>,
        options?: ChannelOptions
      ) => CentyDaemonClient
    }
  }
}

let clientInstance: CentyDaemonClient | null = null

function getAddress(): string {
  // eslint-disable-next-line no-restricted-syntax
  const envAddr = process.env['CENTY_DAEMON_ADDR']
  if (envAddr !== undefined && envAddr !== '') {
    return envAddr
  }
  return DEFAULT_DAEMON_ADDRESS
}

/**
 * Reset the client instance (useful for testing or reconnection)
 */
export function resetDaemonClient(): void {
  clientInstance = null
}

/**
 * Load proto and create daemon client with channel options for connection management.
 * The client uses keepalive and reconnection settings to handle network issues.
 */
export function getDaemonClient(): CentyDaemonClient {
  if (clientInstance !== null) {
    return clientInstance
  }

  const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })

  // eslint-disable-next-line no-restricted-syntax
  const protoDescriptor = loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoDescriptor

  const address = getAddress()
  clientInstance = new protoDescriptor.centy.v1.CentyDaemon(
    address,
    credentials.createInsecure(),
    CHANNEL_OPTIONS
  )

  return clientInstance
}
