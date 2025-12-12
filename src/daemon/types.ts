/* eslint-disable max-lines */
/**
 * Types for daemon gRPC communication
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
}

export interface CreateIssueResponse {
  success: boolean
  error: string
  id: string
  displayNumber: number
  issueNumber: string
  createdFiles: string[]
  manifest?: Manifest
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

// ============ Config Types ============

export interface GetConfigRequest {
  projectPath: string
}

export interface Config {
  customFields: CustomFieldDefinition[]
  defaults: Record<string, string>
  priorityLevels: number
  allowedStates: string[]
  defaultState: string
  version: string
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
  compacted: boolean
  compactedAt: string
}

export interface GetIssueRequest {
  projectPath: string
  issueId: string
}

export interface GetIssueByDisplayNumberRequest {
  projectPath: string
  displayNumber: number
}

// ============ Global Issue Search Types ============

export interface GetIssuesByUuidRequest {
  uuid: string
}

export interface IssueWithProject {
  issue: Issue
  projectPath: string
  projectName: string
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
}

export interface UpdateIssueResponse {
  success: boolean
  error: string
  issue: Issue
  manifest?: Manifest
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
}

export interface CreateDocRequest {
  projectPath: string
  title: string
  content: string
  slug?: string
  template?: string
}

export interface CreateDocResponse {
  success: boolean
  error: string
  slug: string
  createdFile: string
  manifest?: Manifest
}

export interface GetDocRequest {
  projectPath: string
  slug: string
}

// ============ Global Doc Search Types ============

export interface GetDocsBySlugRequest {
  slug: string
}

export interface DocWithProject {
  doc: Doc
  projectPath: string
  projectName: string
}

export interface GetDocsBySlugResponse {
  docs: DocWithProject[]
  totalCount: number
  errors: string[]
}

export interface ListDocsRequest {
  projectPath: string
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
  prId?: string
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
  organizationSlug: string
  organizationName: string
}

export interface ListProjectsRequest {
  includeStale?: boolean
  includeUninitialized?: boolean
  includeArchived?: boolean
  organizationSlug?: string
  ungroupedOnly?: boolean
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

// ============ Organization Types ============

export interface Organization {
  slug: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  projectCount: number
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
  availableVersions: string[]
  binaryPath: string
}

export interface GetProjectVersionRequest {
  projectPath: string
}

export interface ProjectVersionInfo {
  projectVersion: string
  daemonVersion: string
  comparison: 'equal' | 'project_behind' | 'project_ahead'
  degradedMode: boolean
}

export interface UpdateVersionRequest {
  projectPath: string
  targetVersion: string
}

export interface UpdateVersionResponse {
  success: boolean
  error: string
  fromVersion: string
  toVersion: string
  migrationsApplied: string[]
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
  linkedIssues: string[]
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
  linkedIssues: string[]
  reviewers: string[]
  priority: number
  priorityLabel: string
  createdAt: string
  updatedAt: string
  mergedAt: string
  closedAt: string
  customFields: Record<string, string>
}

export interface GetPrRequest {
  projectPath: string
  prId: string
}

export interface GetPrByDisplayNumberRequest {
  projectPath: string
  displayNumber: number
}

// ============ Global PR Search Types ============

export interface GetPrsByUuidRequest {
  uuid: string
}

export interface PrWithProject {
  pr: PullRequest
  projectPath: string
  projectName: string
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
  linkedIssues?: string[]
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

// ============ Features Types ============

export interface GetFeatureStatusRequest {
  projectPath: string
}

export interface GetFeatureStatusResponse {
  initialized: boolean
  hasCompact: boolean
  hasInstruction: boolean
  migrationCount: number
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

// ============ Organization Issue Types ============

export interface OrgIssue {
  id: string
  displayNumber: number
  issueNumber: string
  title: string
  description: string
  metadata: OrgIssueMetadata
}

export interface OrgIssueMetadata {
  displayNumber: number
  status: string
  priority: number
  createdAt: string
  updatedAt: string
  customFields: Record<string, string>
  priorityLabel: string
  referencedProjects: string[]
}

export interface CreateOrgIssueRequest {
  orgSlug: string
  title: string
  description: string
  priority: number
  status: string
  customFields: Record<string, string>
  referencedProjects: string[]
}

export interface CreateOrgIssueResponse {
  success: boolean
  error: string
  id: string
  displayNumber: number
  issueNumber: string
  createdFiles: string[]
}

export interface GetOrgIssueRequest {
  orgSlug: string
  issueId: string
}

export interface GetOrgIssueByDisplayNumberRequest {
  orgSlug: string
  displayNumber: number
}

export interface ListOrgIssuesRequest {
  orgSlug: string
  status?: string
  priority?: number
}

export interface ListOrgIssuesResponse {
  issues: OrgIssue[]
  totalCount: number
}

export interface UpdateOrgIssueRequest {
  orgSlug: string
  issueId: string
  title?: string
  description?: string
  status?: string
  priority?: number
  customFields?: Record<string, string>
  referencedProjects?: string[]
}

export interface UpdateOrgIssueResponse {
  success: boolean
  error: string
  issue: OrgIssue
}

export interface DeleteOrgIssueRequest {
  orgSlug: string
  issueId: string
}

export interface DeleteOrgIssueResponse {
  success: boolean
  error: string
}

export interface GetOrgConfigRequest {
  orgSlug: string
}

export interface OrgConfig {
  priorityLevels: number
  allowedStates: string[]
  defaultState: string
  customFields: CustomFieldDefinition[]
}

export interface UpdateOrgConfigRequest {
  orgSlug: string
  config: OrgConfig
}

export interface UpdateOrgConfigResponse {
  success: boolean
  error: string
  config: OrgConfig
}
