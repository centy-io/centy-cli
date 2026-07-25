import type {
  GetManifestRequest,
  GetManifestResponse,
  GetConfigRequest,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  AddAssetRequest,
  AddAssetResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  GetAssetRequest,
  GetAssetResponse,
  DeleteAssetRequest,
  DeleteAssetResponse,
  ListSharedAssetsRequest,
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for manifest, config, and asset operations
 */
export interface CentyDaemonDataClient {
  getManifest: GrpcMethod<GetManifestRequest, GetManifestResponse>
  getConfig: GrpcMethod<GetConfigRequest, GetConfigResponse>
  updateConfig: GrpcMethod<UpdateConfigRequest, UpdateConfigResponse>
  addAsset: GrpcMethod<AddAssetRequest, AddAssetResponse>
  listAssets: GrpcMethod<ListAssetsRequest, ListAssetsResponse>
  getAsset: GrpcMethod<GetAssetRequest, GetAssetResponse>
  deleteAsset: GrpcMethod<DeleteAssetRequest, DeleteAssetResponse>
  listSharedAssets: GrpcMethod<ListSharedAssetsRequest, ListAssetsResponse>
}
