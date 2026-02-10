import type {
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
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for project and organization operations
 */
export interface CentyDaemonProjectClient {
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
}
