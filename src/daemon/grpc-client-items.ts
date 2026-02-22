import type {
  CreateItemRequest,
  CreateItemResponse,
  GetItemRequest,
  GetItemResponse,
  ListItemsRequest,
  ListItemsResponse,
  UpdateItemRequest,
  UpdateItemResponse,
  DeleteItemRequest,
  DeleteItemResponse,
  SoftDeleteItemRequest,
  SoftDeleteItemResponse,
  RestoreItemRequest,
  RestoreItemResponse,
  DuplicateItemRequest,
  DuplicateItemResponse,
  MoveItemRequest,
  MoveItemResponse,
  AdvancedSearchRequest,
  AdvancedSearchResponse,
  GetAvailableLinkTypesRequest,
  GetAvailableLinkTypesResponse,
  GetSupportedEditorsRequest,
  GetSupportedEditorsResponse,
  CreateItemTypeRequest,
  CreateItemTypeResponse,
  ListItemTypesRequest,
  ListItemTypesResponse,
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for generic item, search, and discovery operations
 */
export interface CentyDaemonItemsClient {
  createItem: GrpcMethod<CreateItemRequest, CreateItemResponse>
  getItem: GrpcMethod<GetItemRequest, GetItemResponse>
  listItems: GrpcMethod<ListItemsRequest, ListItemsResponse>
  updateItem: GrpcMethod<UpdateItemRequest, UpdateItemResponse>
  deleteItem: GrpcMethod<DeleteItemRequest, DeleteItemResponse>
  softDeleteItem: GrpcMethod<SoftDeleteItemRequest, SoftDeleteItemResponse>
  restoreItem: GrpcMethod<RestoreItemRequest, RestoreItemResponse>
  advancedSearch: GrpcMethod<AdvancedSearchRequest, AdvancedSearchResponse>
  getAvailableLinkTypes: GrpcMethod<
    GetAvailableLinkTypesRequest,
    GetAvailableLinkTypesResponse
  >
  getSupportedEditors: GrpcMethod<
    GetSupportedEditorsRequest,
    GetSupportedEditorsResponse
  >
  duplicateItem: GrpcMethod<DuplicateItemRequest, DuplicateItemResponse>
  moveItem: GrpcMethod<MoveItemRequest, MoveItemResponse>
  createItemType: GrpcMethod<CreateItemTypeRequest, CreateItemTypeResponse>
  listItemTypes: GrpcMethod<ListItemTypesRequest, ListItemTypesResponse>
}
