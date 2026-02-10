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
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for init and issue operations
 */
export interface CentyDaemonInitClient {
  init: GrpcMethod<InitRequest, InitResponse>
  getReconciliationPlan: GrpcMethod<
    GetReconciliationPlanRequest,
    ReconciliationPlan
  >
  executeReconciliation: GrpcMethod<ExecuteReconciliationRequest, InitResponse>
  isInitialized: GrpcMethod<IsInitializedRequest, IsInitializedResponse>
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
}
