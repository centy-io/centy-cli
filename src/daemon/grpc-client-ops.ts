import type {
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
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for PR, features, and user operations
 */
export interface CentyDaemonOpsClient {
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
  createUser: GrpcMethod<CreateUserRequest, CreateUserResponse>
  getUser: GrpcMethod<GetUserRequest, GetUserResponse>
  listUsers: GrpcMethod<ListUsersRequest, ListUsersResponse>
  updateUser: GrpcMethod<UpdateUserRequest, UpdateUserResponse>
  deleteUser: GrpcMethod<DeleteUserRequest, DeleteUserResponse>
  softDeleteUser: GrpcMethod<SoftDeleteUserRequest, SoftDeleteUserResponse>
  restoreUser: GrpcMethod<RestoreUserRequest, RestoreUserResponse>
  syncUsers: GrpcMethod<SyncUsersRequest, SyncUsersResponse>
}
