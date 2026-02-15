import type {
  CreateLinkRequest,
  CreateLinkResponse,
  DeleteLinkRequest,
  DeleteLinkResponse,
  ListLinksRequest,
  ListLinksResponse,
  GetAvailableLinkTypesRequest,
  GetAvailableLinkTypesResponse,
} from './types.js'
import type { GrpcMethod } from './grpc-utils.js'

/**
 * Daemon client methods for link operations
 */
export interface CentyDaemonLinkClient {
  createLink: GrpcMethod<CreateLinkRequest, CreateLinkResponse>
  deleteLink: GrpcMethod<DeleteLinkRequest, DeleteLinkResponse>
  listLinks: GrpcMethod<ListLinksRequest, ListLinksResponse>
  getAvailableLinkTypes: GrpcMethod<
    GetAvailableLinkTypesRequest,
    GetAvailableLinkTypesResponse
  >
}
