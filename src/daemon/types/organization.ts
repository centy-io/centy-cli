/* eslint-disable single-export/single-export */
/**
 * Organization-related types for daemon gRPC communication.
 */

export interface Organization {
  slug: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  projectCount: number
}

export interface OrgInferenceResult {
  inferredOrgSlug: string
  inferredOrgName: string
  orgCreated: boolean
  existingOrgSlug: string
  hasMismatch: boolean
  message: string
}

export interface CreateOrganizationRequest {
  slug?: string
  name: string
  description?: string
}

export interface CreateOrganizationResponse {
  success: boolean
  error: string
  organization?: Organization
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListOrganizationsRequest {}

export interface ListOrganizationsResponse {
  organizations: Organization[]
  totalCount: number
}

export interface GetOrganizationRequest {
  slug: string
}

export interface GetOrganizationResponse {
  found: boolean
  organization?: Organization
}

export interface UpdateOrganizationRequest {
  slug: string
  name?: string
  description?: string
  newSlug?: string
}

export interface UpdateOrganizationResponse {
  success: boolean
  error: string
  organization?: Organization
}

export interface DeleteOrganizationRequest {
  slug: string
}

export interface DeleteOrganizationResponse {
  success: boolean
  error: string
  unassignedProjects: number
}
