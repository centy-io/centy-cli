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
  managedFiles: ManagedFile[]
}

export interface ManagedFile {
  path: string
  hash: string
  version: string
  createdAt: string
  fileType: 'FILE_TYPE_UNSPECIFIED' | 'FILE_TYPE_FILE' | 'FILE_TYPE_DIRECTORY'
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
}

export interface GetIssueRequest {
  projectPath: string
  issueId: string
}

export interface GetIssueByDisplayNumberRequest {
  projectPath: string
  displayNumber: number
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
}

export interface ListProjectsRequest {
  includeStale?: boolean
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

// ============ Version Types ============

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetDaemonInfoRequest {}

export interface DaemonInfo {
  version: string
  availableVersions: string[]
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
