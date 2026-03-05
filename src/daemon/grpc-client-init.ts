import type {
  InitRequest,
  InitResponse,
  GetReconciliationPlanRequest,
  ReconciliationPlan,
  ExecuteReconciliationRequest,
  IsInitializedRequest,
  IsInitializedResponse,
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for init operations
 */
export interface CentyDaemonInitClient {
  init: GrpcMethod<InitRequest, InitResponse>
  getReconciliationPlan: GrpcMethod<
    GetReconciliationPlanRequest,
    ReconciliationPlan
  >
  executeReconciliation: GrpcMethod<ExecuteReconciliationRequest, InitResponse>
  isInitialized: GrpcMethod<IsInitializedRequest, IsInitializedResponse>
}
