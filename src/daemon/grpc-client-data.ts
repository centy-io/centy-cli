import type {
  GetManifestRequest,
  GetManifestResponse,
  GetConfigRequest,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  CreateDocRequest,
  CreateDocResponse,
  GetDocRequest,
  GetDocsBySlugRequest,
  GetDocsBySlugResponse,
  GetDocResponse,
  ListDocsRequest,
  ListDocsResponse,
  UpdateDocRequest,
  UpdateDocResponse,
  DeleteDocRequest,
  DeleteDocResponse,
  SoftDeleteDocRequest,
  SoftDeleteDocResponse,
  RestoreDocRequest,
  RestoreDocResponse,
  MoveDocRequest,
  MoveDocResponse,
  DuplicateDocRequest,
  DuplicateDocResponse,
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
 * Daemon client methods for manifest, config, doc, and asset operations
 */
export interface CentyDaemonDataClient {
  getManifest: GrpcMethod<GetManifestRequest, GetManifestResponse>
  getConfig: GrpcMethod<GetConfigRequest, GetConfigResponse>
  updateConfig: GrpcMethod<UpdateConfigRequest, UpdateConfigResponse>
  createDoc: GrpcMethod<CreateDocRequest, CreateDocResponse>
  getDoc: GrpcMethod<GetDocRequest, GetDocResponse>
  getDocsBySlug: GrpcMethod<GetDocsBySlugRequest, GetDocsBySlugResponse>
  listDocs: GrpcMethod<ListDocsRequest, ListDocsResponse>
  updateDoc: GrpcMethod<UpdateDocRequest, UpdateDocResponse>
  deleteDoc: GrpcMethod<DeleteDocRequest, DeleteDocResponse>
  softDeleteDoc: GrpcMethod<SoftDeleteDocRequest, SoftDeleteDocResponse>
  restoreDoc: GrpcMethod<RestoreDocRequest, RestoreDocResponse>
  moveDoc: GrpcMethod<MoveDocRequest, MoveDocResponse>
  duplicateDoc: GrpcMethod<DuplicateDocRequest, DuplicateDocResponse>
  addAsset: GrpcMethod<AddAssetRequest, AddAssetResponse>
  listAssets: GrpcMethod<ListAssetsRequest, ListAssetsResponse>
  getAsset: GrpcMethod<GetAssetRequest, GetAssetResponse>
  deleteAsset: GrpcMethod<DeleteAssetRequest, DeleteAssetResponse>
  listSharedAssets: GrpcMethod<ListSharedAssetsRequest, ListAssetsResponse>
}
