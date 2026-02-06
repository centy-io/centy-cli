/* eslint-disable max-lines , single-export/single-export */
/**
 * Types for daemon gRPC communication (centy.v1)
 */

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

// ============ Issue Types ============

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

// ============ Manifest Types ============

export interface GetManifestRequest {
  projectPath: string
}

export interface GetManifestResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

// ============ Config Types ============

export interface GetConfigRequest {
  projectPath: string
}

export interface GetConfigResponse {
  success: boolean
  error: string
  config?: Config
}

export interface LlmConfig {
  autoCloseOnComplete: boolean
  updateStatusOnStart?: boolean
  allowDirectEdits: boolean
  defaultWorkspaceMode?: string
}

export interface LinkTypeDefinition {
  name: string
  inverse: string
  description: string
}

export interface HookDefinition {
  pattern: string
  command: string
  runAsync: boolean
  timeout: number
  enabled: boolean
}

export interface Config {
  customFields: CustomFieldDefinition[]
  defaults: Record<string, string>
  priorityLevels: number
  allowedStates: string[]
  defaultState: string
  version: string
  stateColors: Record<string, string>
  priorityColors: Record<string, string>
  llm: LlmConfig
  customLinkTypes: LinkTypeDefinition[]
  defaultEditor: string
  hooks: HookDefinition[]
}

export interface UpdateConfigRequest {
  projectPath: string
  config: Config
}

export interface UpdateConfigResponse {
  success: boolean
  error: string
  config: Config
}

export interface CustomFieldDefinition {
  name: string
  fieldType: string
  required: boolean
  defaultValue: string
  enumValues: string[]
}

// ============ Issue Types (continued) ============

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

// ============ Global Issue Search Types ============

export interface GetIssuesByUuidRequest {
  uuid: string
}

export interface IssueWithProject {
  issue: Issue
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GetIssuesByUuidResponse {
  issues: IssueWithProject[]
  totalCount: number
  errors: string[]
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

// ============ Advanced Search Types ============

export interface AdvancedSearchRequest {
  query: string
  sortBy?: string
  sortDescending?: boolean
  multiProject?: boolean
  projectPath?: string
}

export interface SearchResultIssue {
  issue: Issue
  projectPath: string
  projectName: string
  displayPath: string
}

export interface AdvancedSearchResponse {
  success: boolean
  error: string
  results: SearchResultIssue[]
  totalCount: number
  parsedQuery: string
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

export interface DeleteIssueRequest {
  projectPath: string
  issueId: string
}

export interface DeleteIssueResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

// ============ Soft Delete/Restore Issue Types ============

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

// ============ Move/Duplicate Issue Types ============

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

// ============ Doc Types ============

export interface Doc {
  slug: string
  title: string
  content: string
  metadata: DocMetadata
}

export interface DocMetadata {
  createdAt: string
  updatedAt: string
  deletedAt: string
  isOrgDoc: boolean
  orgSlug: string
}

export interface CreateDocRequest {
  projectPath: string
  title: string
  content: string
  slug?: string
  template?: string
  isOrgDoc?: boolean
}

export interface OrgDocSyncResult {
  projectPath: string
  success: boolean
  error: string
}

export interface CreateDocResponse {
  success: boolean
  error: string
  slug: string
  createdFile: string
  manifest?: Manifest
  syncResults?: OrgDocSyncResult[]
}

export interface GetDocRequest {
  projectPath: string
  slug: string
}

export interface GetDocResponse {
  success: boolean
  error: string
  doc?: Doc
}

// ============ Global Doc Search Types ============

export interface GetDocsBySlugRequest {
  slug: string
}

export interface DocWithProject {
  doc: Doc
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GetDocsBySlugResponse {
  docs: DocWithProject[]
  totalCount: number
  errors: string[]
}

export interface ListDocsRequest {
  projectPath: string
  includeDeleted?: boolean
}

export interface ListDocsResponse {
  docs: Doc[]
  totalCount: number
}

export interface UpdateDocRequest {
  projectPath: string
  slug: string
  title?: string
  content?: string
  newSlug?: string
}

export interface UpdateDocResponse {
  success: boolean
  error: string
  doc: Doc
  manifest?: Manifest
  syncResults?: OrgDocSyncResult[]
}

export interface DeleteDocRequest {
  projectPath: string
  slug: string
}

export interface DeleteDocResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

// ============ Soft Delete/Restore Doc Types ============

export interface SoftDeleteDocRequest {
  projectPath: string
  slug: string
}

export interface SoftDeleteDocResponse {
  success: boolean
  error: string
  doc?: Doc
  manifest?: Manifest
}

export interface RestoreDocRequest {
  projectPath: string
  slug: string
}

export interface RestoreDocResponse {
  success: boolean
  error: string
  doc?: Doc
  manifest?: Manifest
}

// ============ Move/Duplicate Doc Types ============

export interface MoveDocRequest {
  sourceProjectPath: string
  slug: string
  targetProjectPath: string
  newSlug?: string
}

export interface MoveDocResponse {
  success: boolean
  error: string
  doc: Doc
  oldSlug: string
  sourceManifest?: Manifest
  targetManifest?: Manifest
}

export interface DuplicateDocRequest {
  sourceProjectPath: string
  slug: string
  targetProjectPath: string
  newSlug?: string
  newTitle?: string
}

export interface DuplicateDocResponse {
  success: boolean
  error: string
  doc: Doc
  originalSlug: string
  manifest?: Manifest
}

// ============ Asset Types ============

export interface Asset {
  filename: string
  hash: string
  size: number
  mimeType: string
  isShared: boolean
  createdAt: string
}

export interface AddAssetRequest {
  projectPath: string
  issueId?: string
  filename: string
  data: Buffer
  isShared?: boolean
}

export interface AddAssetResponse {
  success: boolean
  error: string
  asset: Asset
  path: string
  manifest?: Manifest
}

export interface ListAssetsRequest {
  projectPath: string
  issueId?: string
  includeShared?: boolean
}

export interface ListAssetsResponse {
  assets: Asset[]
  totalCount: number
}

export interface GetAssetRequest {
  projectPath: string
  issueId?: string
  filename: string
  isShared?: boolean
}

export interface GetAssetResponse {
  success: boolean
  error: string
  data: Buffer
  asset: Asset
}

export interface DeleteAssetRequest {
  projectPath: string
  issueId?: string
  filename: string
  isShared?: boolean
}

export interface DeleteAssetResponse {
  success: boolean
  error: string
  filename: string
  wasShared: boolean
  manifest?: Manifest
}

export interface ListSharedAssetsRequest {
  projectPath: string
}

// ============ Project Registry Types ============

export interface ProjectInfo {
  path: string
  firstAccessed: string
  lastAccessed: string
  issueCount: number
  docCount: number
  initialized: boolean
  name: string
  isFavorite: boolean
  isArchived: boolean
  displayPath: string
  organizationSlug: string
  organizationName: string
  userTitle: string
  projectTitle: string
}

export interface ListProjectsRequest {
  includeStale?: boolean
  includeUninitialized?: boolean
  includeArchived?: boolean
  organizationSlug?: string
  ungroupedOnly?: boolean
  includeTemp?: boolean
}

export interface ListProjectsResponse {
  projects: ProjectInfo[]
  totalCount: number
}

export interface RegisterProjectRequest {
  projectPath: string
}

export interface RegisterProjectResponse {
  success: boolean
  error: string
  project: ProjectInfo
  orgInference?: OrgInferenceResult
}

export interface UntrackProjectRequest {
  projectPath: string
}

export interface UntrackProjectResponse {
  success: boolean
  error: string
}

export interface GetProjectInfoRequest {
  projectPath: string
}

export interface GetProjectInfoResponse {
  found: boolean
  project: ProjectInfo
}

export interface SetProjectFavoriteRequest {
  projectPath: string
  isFavorite: boolean
}

export interface SetProjectFavoriteResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectArchivedRequest {
  projectPath: string
  isArchived: boolean
}

export interface SetProjectArchivedResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectOrganizationRequest {
  projectPath: string
  organizationSlug: string
}

export interface SetProjectOrganizationResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectUserTitleRequest {
  projectPath: string
  title: string
}

export interface SetProjectUserTitleResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectTitleRequest {
  projectPath: string
  title: string
}

export interface SetProjectTitleResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

// ============ Organization Types ============

export interface Organization {
  slug: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  projectCount: number
}

export interface OrgInferenceResult {
  inferredOrgSlug: string
  inferredOrgName: string
  orgCreated: boolean
  existingOrgSlug: string
  hasMismatch: boolean
  message: string
}

export interface CreateOrganizationRequest {
  slug?: string
  name: string
  description?: string
}

export interface CreateOrganizationResponse {
  success: boolean
  error: string
  organization?: Organization
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListOrganizationsRequest {}

export interface ListOrganizationsResponse {
  organizations: Organization[]
  totalCount: number
}

export interface GetOrganizationRequest {
  slug: string
}

export interface GetOrganizationResponse {
  found: boolean
  organization?: Organization
}

export interface UpdateOrganizationRequest {
  slug: string
  name?: string
  description?: string
  newSlug?: string
}

export interface UpdateOrganizationResponse {
  success: boolean
  error: string
  organization?: Organization
}

export interface DeleteOrganizationRequest {
  slug: string
}

export interface DeleteOrganizationResponse {
  success: boolean
  error: string
  unassignedProjects: number
}

// ============ Version Types ============

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetDaemonInfoRequest {}

export interface DaemonInfo {
  version: string
  binaryPath: string
  vscodeAvailable: boolean
}

// ============ Daemon Control Types ============

export interface ShutdownRequest {
  delaySeconds?: number
}

export interface ShutdownResponse {
  success: boolean
  message: string
}

export interface RestartRequest {
  delaySeconds?: number
}

export interface RestartResponse {
  success: boolean
  message: string
}

// ============ PR Types ============

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

// ============ Global PR Search Types ============

export interface GetPrsByUuidRequest {
  uuid: string
}

export interface PrWithProject {
  pr: PullRequest
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GetPrsByUuidResponse {
  prs: PrWithProject[]
  totalCount: number
  errors: string[]
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

export interface UpdatePrRequest {
  projectPath: string
  prId: string
  title?: string
  description?: string
  status?: string
  sourceBranch?: string
  targetBranch?: string
  reviewers?: string[]
  priority?: number
  customFields?: Record<string, string>
}

export interface UpdatePrResponse {
  success: boolean
  error: string
  pr: PullRequest
  manifest?: Manifest
}

export interface DeletePrRequest {
  projectPath: string
  prId: string
}

export interface DeletePrResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

// ============ Soft Delete/Restore PR Types ============

export interface SoftDeletePrRequest {
  projectPath: string
  prId: string
}

export interface SoftDeletePrResponse {
  success: boolean
  error: string
  pr?: PullRequest
  manifest?: Manifest
}

export interface RestorePrRequest {
  projectPath: string
  prId: string
}

export interface RestorePrResponse {
  success: boolean
  error: string
  pr?: PullRequest
  manifest?: Manifest
}

// ============ Temp Workspace Types ============

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetSupportedEditorsRequest {}

export interface EditorInfo {
  editorType: string
  name: string
  description: string
  available: boolean
  editorId: string
  terminalWrapper: boolean
}

export interface GetSupportedEditorsResponse {
  editors: EditorInfo[]
}

export interface OpenInTempWorkspaceWithEditorRequest {
  projectPath: string
  issueId: string
  action: string
  agentName?: string
  ttlHours?: number
  editorId?: string
}

export interface OpenStandaloneWorkspaceWithEditorRequest {
  projectPath: string
  name?: string
  description?: string
  ttlHours?: number
  agentName?: string
  editorId?: string
}

export interface OpenInTempWorkspaceRequest {
  projectPath: string
  issueId: string
  action: string
  agentName?: string
  ttlHours?: number
}

export interface OpenInTempWorkspaceResponse {
  success: boolean
  error: string
  workspacePath: string
  issueId: string
  displayNumber: number
  expiresAt: string
  editorOpened: boolean
  requiresStatusConfig: boolean
  workspaceReused: boolean
  originalCreatedAt: string
}

export interface OpenAgentInTerminalRequest {
  projectPath: string
  issueId: string
  agentName?: string
  workspaceMode?: string
  ttlHours?: number
}

export interface OpenAgentInTerminalResponse {
  success: boolean
  error: string
  workingDirectory: string
  issueId: string
  displayNumber: number
  agentCommand: string
  terminalOpened: boolean
  expiresAt: string
  requiresStatusConfig: boolean
}

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

// ============ Link Types ============

export interface Link {
  targetId: string
  targetType: string
  linkType: string
  createdAt: string
}

export interface CreateLinkRequest {
  projectPath: string
  sourceId: string
  sourceType: string
  targetId: string
  targetType: string
  linkType: string
}

export interface CreateLinkResponse {
  success: boolean
  error: string
  createdLink?: Link
  inverseLink?: Link
}

export interface DeleteLinkRequest {
  projectPath: string
  sourceId: string
  sourceType: string
  targetId: string
  targetType: string
  linkType?: string
}

export interface DeleteLinkResponse {
  success: boolean
  error: string
  deletedCount: number
}

export interface ListLinksRequest {
  projectPath: string
  entityId: string
  entityType: string
}

export interface ListLinksResponse {
  links: Link[]
  totalCount: number
}

export interface GetAvailableLinkTypesRequest {
  projectPath: string
}

export interface LinkTypeInfo {
  name: string
  inverse: string
  description: string
  isBuiltin: boolean
}

export interface GetAvailableLinkTypesResponse {
  linkTypes: LinkTypeInfo[]
}

// ============ User Types ============

export interface User {
  id: string
  name: string
  email: string
  gitUsernames: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export interface CreateUserRequest {
  projectPath: string
  id: string
  name: string
  email?: string
  gitUsernames?: string[]
}

export interface CreateUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface GetUserRequest {
  projectPath: string
  userId: string
}

export interface GetUserResponse {
  success: boolean
  error: string
  user?: User
}

export interface ListUsersRequest {
  projectPath: string
  gitUsername?: string
  includeDeleted?: boolean
}

export interface ListUsersResponse {
  users: User[]
  totalCount: number
}

export interface UpdateUserRequest {
  projectPath: string
  userId: string
  name?: string
  email?: string
  gitUsernames?: string[]
}

export interface UpdateUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface DeleteUserRequest {
  projectPath: string
  userId: string
}

export interface DeleteUserResponse {
  success: boolean
  error: string
  manifest?: Manifest
}

// ============ Soft Delete/Restore User Types ============

export interface SoftDeleteUserRequest {
  projectPath: string
  userId: string
}

export interface SoftDeleteUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface RestoreUserRequest {
  projectPath: string
  userId: string
}

export interface RestoreUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface GitContributor {
  name: string
  email: string
}

export interface SyncUsersRequest {
  projectPath: string
  dryRun: boolean
}

export interface SyncUsersResponse {
  success: boolean
  error: string
  created: string[]
  skipped: string[]
  errors: string[]
  wouldCreate: GitContributor[]
  wouldSkip: GitContributor[]
  manifest?: Manifest
}

// ============ Entity Actions Types ============

export interface EntityAction {
  id: string
  label: string
  category: string
  enabled: boolean
  disabledReason: string
  destructive: boolean
  keyboardShortcut: string
}

export interface GetEntityActionsRequest {
  projectPath: string
  entityType: string
  entityId?: string
}

export interface GetEntityActionsResponse {
  actions: EntityAction[]
  success: boolean
  error: string
}

// ============ Sync Types ============

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

// ============ Features Types (CLI-side only, not in daemon) ============

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
