/* eslint-disable max-lines */
import { loadPackageDefinition, credentials } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
// eslint-disable-next-line import/order
import { dirname, join } from 'node:path'
// eslint-disable-next-line import/order
import { fileURLToPath } from 'node:url'
import type { ServiceError } from '@grpc/grpc-js'
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
  Manifest,
  GetConfigRequest,
  Config,
  GetIssueRequest,
  GetIssueByDisplayNumberRequest,
  GetIssuesByUuidRequest,
  GetIssuesByUuidResponse,
  Issue,
  ListIssuesRequest,
  ListIssuesResponse,
  UpdateIssueRequest,
  UpdateIssueResponse,
  DeleteIssueRequest,
  DeleteIssueResponse,
  CreateDocRequest,
  CreateDocResponse,
  GetDocRequest,
  GetDocsBySlugRequest,
  GetDocsBySlugResponse,
  Doc,
  ListDocsRequest,
  ListDocsResponse,
  UpdateDocRequest,
  UpdateDocResponse,
  DeleteDocRequest,
  DeleteDocResponse,
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
  GetProjectVersionRequest,
  ProjectVersionInfo,
  UpdateVersionRequest,
  UpdateVersionResponse,
  GetNextIssueNumberRequest,
  GetNextIssueNumberResponse,
  ShutdownRequest,
  ShutdownResponse,
  RestartRequest,
  RestartResponse,
  // PR types
  CreatePrRequest,
  CreatePrResponse,
  GetPrRequest,
  GetPrByDisplayNumberRequest,
  GetPrsByUuidRequest,
  GetPrsByUuidResponse,
  PullRequest,
  ListPrsRequest,
  ListPrsResponse,
  UpdatePrRequest,
  UpdatePrResponse,
  DeletePrRequest,
  DeletePrResponse,
  GetNextPrNumberRequest,
  GetNextPrNumberResponse,
  // Features types
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
  // Organization types
  SetProjectOrganizationRequest,
  SetProjectOrganizationResponse,
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
  // Org issue types
  CreateOrgIssueRequest,
  CreateOrgIssueResponse,
  GetOrgIssueRequest,
  GetOrgIssueByDisplayNumberRequest,
  OrgIssue,
  ListOrgIssuesRequest,
  ListOrgIssuesResponse,
  UpdateOrgIssueRequest,
  UpdateOrgIssueResponse,
  DeleteOrgIssueRequest,
  DeleteOrgIssueResponse,
  GetOrgConfigRequest,
  OrgConfig,
  UpdateOrgConfigRequest,
  UpdateOrgConfigResponse,
} from './types.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = join(currentDir, '../../proto/centy.proto')

const DEFAULT_DAEMON_ADDRESS = '127.0.0.1:50051'

interface CentyDaemonClient {
  // Init operations
  init(
    request: InitRequest,
    callback: (error: ServiceError | null, response: InitResponse) => void
  ): void
  getReconciliationPlan(
    request: GetReconciliationPlanRequest,
    callback: (error: ServiceError | null, response: ReconciliationPlan) => void
  ): void
  executeReconciliation(
    request: ExecuteReconciliationRequest,
    callback: (error: ServiceError | null, response: InitResponse) => void
  ): void
  isInitialized(
    request: IsInitializedRequest,
    callback: (
      error: ServiceError | null,
      response: IsInitializedResponse
    ) => void
  ): void

  // Issue operations
  createIssue(
    request: CreateIssueRequest,
    callback: (
      error: ServiceError | null,
      response: CreateIssueResponse
    ) => void
  ): void
  getIssue(
    request: GetIssueRequest,
    callback: (error: ServiceError | null, response: Issue) => void
  ): void
  getIssueByDisplayNumber(
    request: GetIssueByDisplayNumberRequest,
    callback: (error: ServiceError | null, response: Issue) => void
  ): void
  getIssuesByUuid(
    request: GetIssuesByUuidRequest,
    callback: (
      error: ServiceError | null,
      response: GetIssuesByUuidResponse
    ) => void
  ): void
  listIssues(
    request: ListIssuesRequest,
    callback: (error: ServiceError | null, response: ListIssuesResponse) => void
  ): void
  updateIssue(
    request: UpdateIssueRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateIssueResponse
    ) => void
  ): void
  deleteIssue(
    request: DeleteIssueRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteIssueResponse
    ) => void
  ): void

  // Manifest and Config
  getManifest(
    request: GetManifestRequest,
    callback: (error: ServiceError | null, response: Manifest) => void
  ): void
  getConfig(
    request: GetConfigRequest,
    callback: (error: ServiceError | null, response: Config) => void
  ): void

  // Doc operations
  createDoc(
    request: CreateDocRequest,
    callback: (error: ServiceError | null, response: CreateDocResponse) => void
  ): void
  getDoc(
    request: GetDocRequest,
    callback: (error: ServiceError | null, response: Doc) => void
  ): void
  getDocsBySlug(
    request: GetDocsBySlugRequest,
    callback: (
      error: ServiceError | null,
      response: GetDocsBySlugResponse
    ) => void
  ): void
  listDocs(
    request: ListDocsRequest,
    callback: (error: ServiceError | null, response: ListDocsResponse) => void
  ): void
  updateDoc(
    request: UpdateDocRequest,
    callback: (error: ServiceError | null, response: UpdateDocResponse) => void
  ): void
  deleteDoc(
    request: DeleteDocRequest,
    callback: (error: ServiceError | null, response: DeleteDocResponse) => void
  ): void

  // Asset operations
  addAsset(
    request: AddAssetRequest,
    callback: (error: ServiceError | null, response: AddAssetResponse) => void
  ): void
  listAssets(
    request: ListAssetsRequest,
    callback: (error: ServiceError | null, response: ListAssetsResponse) => void
  ): void
  getAsset(
    request: GetAssetRequest,
    callback: (error: ServiceError | null, response: GetAssetResponse) => void
  ): void
  deleteAsset(
    request: DeleteAssetRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteAssetResponse
    ) => void
  ): void
  listSharedAssets(
    request: ListSharedAssetsRequest,
    callback: (error: ServiceError | null, response: ListAssetsResponse) => void
  ): void

  // Project registry operations
  listProjects(
    request: ListProjectsRequest,
    callback: (
      error: ServiceError | null,
      response: ListProjectsResponse
    ) => void
  ): void
  registerProject(
    request: RegisterProjectRequest,
    callback: (
      error: ServiceError | null,
      response: RegisterProjectResponse
    ) => void
  ): void
  untrackProject(
    request: UntrackProjectRequest,
    callback: (
      error: ServiceError | null,
      response: UntrackProjectResponse
    ) => void
  ): void
  getProjectInfo(
    request: GetProjectInfoRequest,
    callback: (
      error: ServiceError | null,
      response: GetProjectInfoResponse
    ) => void
  ): void
  setProjectFavorite(
    request: SetProjectFavoriteRequest,
    callback: (
      error: ServiceError | null,
      response: SetProjectFavoriteResponse
    ) => void
  ): void
  setProjectArchived(
    request: SetProjectArchivedRequest,
    callback: (
      error: ServiceError | null,
      response: SetProjectArchivedResponse
    ) => void
  ): void
  setProjectOrganization(
    request: SetProjectOrganizationRequest,
    callback: (
      error: ServiceError | null,
      response: SetProjectOrganizationResponse
    ) => void
  ): void

  // Organization operations
  createOrganization(
    request: CreateOrganizationRequest,
    callback: (
      error: ServiceError | null,
      response: CreateOrganizationResponse
    ) => void
  ): void
  listOrganizations(
    request: ListOrganizationsRequest,
    callback: (
      error: ServiceError | null,
      response: ListOrganizationsResponse
    ) => void
  ): void
  getOrganization(
    request: GetOrganizationRequest,
    callback: (
      error: ServiceError | null,
      response: GetOrganizationResponse
    ) => void
  ): void
  updateOrganization(
    request: UpdateOrganizationRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateOrganizationResponse
    ) => void
  ): void
  deleteOrganization(
    request: DeleteOrganizationRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteOrganizationResponse
    ) => void
  ): void

  // Org issue operations
  createOrgIssue(
    request: CreateOrgIssueRequest,
    callback: (
      error: ServiceError | null,
      response: CreateOrgIssueResponse
    ) => void
  ): void
  getOrgIssue(
    request: GetOrgIssueRequest,
    callback: (error: ServiceError | null, response: OrgIssue) => void
  ): void
  getOrgIssueByDisplayNumber(
    request: GetOrgIssueByDisplayNumberRequest,
    callback: (error: ServiceError | null, response: OrgIssue) => void
  ): void
  listOrgIssues(
    request: ListOrgIssuesRequest,
    callback: (
      error: ServiceError | null,
      response: ListOrgIssuesResponse
    ) => void
  ): void
  updateOrgIssue(
    request: UpdateOrgIssueRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateOrgIssueResponse
    ) => void
  ): void
  deleteOrgIssue(
    request: DeleteOrgIssueRequest,
    callback: (
      error: ServiceError | null,
      response: DeleteOrgIssueResponse
    ) => void
  ): void
  getOrgConfig(
    request: GetOrgConfigRequest,
    callback: (error: ServiceError | null, response: OrgConfig) => void
  ): void
  updateOrgConfig(
    request: UpdateOrgConfigRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateOrgConfigResponse
    ) => void
  ): void

  // Version operations
  getDaemonInfo(
    request: GetDaemonInfoRequest,
    callback: (error: ServiceError | null, response: DaemonInfo) => void
  ): void
  getProjectVersion(
    request: GetProjectVersionRequest,
    callback: (error: ServiceError | null, response: ProjectVersionInfo) => void
  ): void
  updateVersion(
    request: UpdateVersionRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateVersionResponse
    ) => void
  ): void

  // Issue number
  getNextIssueNumber(
    request: GetNextIssueNumberRequest,
    callback: (
      error: ServiceError | null,
      response: GetNextIssueNumberResponse
    ) => void
  ): void

  // Daemon control operations
  shutdown(
    request: ShutdownRequest,
    callback: (error: ServiceError | null, response: ShutdownResponse) => void
  ): void
  restart(
    request: RestartRequest,
    callback: (error: ServiceError | null, response: RestartResponse) => void
  ): void

  // PR operations
  createPr(
    request: CreatePrRequest,
    callback: (error: ServiceError | null, response: CreatePrResponse) => void
  ): void
  getPr(
    request: GetPrRequest,
    callback: (error: ServiceError | null, response: PullRequest) => void
  ): void
  getPrByDisplayNumber(
    request: GetPrByDisplayNumberRequest,
    callback: (error: ServiceError | null, response: PullRequest) => void
  ): void
  getPrsByUuid(
    request: GetPrsByUuidRequest,
    callback: (
      error: ServiceError | null,
      response: GetPrsByUuidResponse
    ) => void
  ): void
  listPrs(
    request: ListPrsRequest,
    callback: (error: ServiceError | null, response: ListPrsResponse) => void
  ): void
  updatePr(
    request: UpdatePrRequest,
    callback: (error: ServiceError | null, response: UpdatePrResponse) => void
  ): void
  deletePr(
    request: DeletePrRequest,
    callback: (error: ServiceError | null, response: DeletePrResponse) => void
  ): void
  getNextPrNumber(
    request: GetNextPrNumberRequest,
    callback: (
      error: ServiceError | null,
      response: GetNextPrNumberResponse
    ) => void
  ): void

  // Features operations
  getFeatureStatus(
    request: GetFeatureStatusRequest,
    callback: (
      error: ServiceError | null,
      response: GetFeatureStatusResponse
    ) => void
  ): void
  listUncompactedIssues(
    request: ListUncompactedIssuesRequest,
    callback: (
      error: ServiceError | null,
      response: ListUncompactedIssuesResponse
    ) => void
  ): void
  getInstruction(
    request: GetInstructionRequest,
    callback: (
      error: ServiceError | null,
      response: GetInstructionResponse
    ) => void
  ): void
  getCompact(
    request: GetCompactRequest,
    callback: (error: ServiceError | null, response: GetCompactResponse) => void
  ): void
  updateCompact(
    request: UpdateCompactRequest,
    callback: (
      error: ServiceError | null,
      response: UpdateCompactResponse
    ) => void
  ): void
  saveMigration(
    request: SaveMigrationRequest,
    callback: (
      error: ServiceError | null,
      response: SaveMigrationResponse
    ) => void
  ): void
  markIssuesCompacted(
    request: MarkIssuesCompactedRequest,
    callback: (
      error: ServiceError | null,
      response: MarkIssuesCompactedResponse
    ) => void
  ): void
}

interface ProtoDescriptor {
  centy: {
    CentyDaemon: new (
      address: string,
      creds: ReturnType<typeof credentials.createInsecure>
    ) => CentyDaemonClient
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
 * Load proto and create daemon client
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
  clientInstance = new protoDescriptor.centy.CentyDaemon(
    address,
    credentials.createInsecure()
  )

  return clientInstance
}
