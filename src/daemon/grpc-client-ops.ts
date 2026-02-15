import type {
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
 * Daemon client methods for features and user operations
 */
export interface CentyDaemonOpsClient {
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
