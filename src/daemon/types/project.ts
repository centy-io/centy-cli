/* eslint-disable single-export/single-export */
/**
 * Project registry types for daemon gRPC communication.
 */

import type { OrgInferenceResult } from './organization.js'

export interface ProjectInfo {
  path: string
  firstAccessed: string
  lastAccessed: string
  issueCount: number
  docCount: number
  initialized: boolean
  name: string
  isFavorite: boolean
  isArchived: boolean
  displayPath: string
  organizationSlug: string
  organizationName: string
  userTitle: string
  projectTitle: string
}

export interface ListProjectsRequest {
  includeStale?: boolean
  includeUninitialized?: boolean
  includeArchived?: boolean
  organizationSlug?: string
  ungroupedOnly?: boolean
  includeTemp?: boolean
}

export interface ListProjectsResponse {
  projects: ProjectInfo[]
  totalCount: number
}

export interface RegisterProjectRequest {
  projectPath: string
}

export interface RegisterProjectResponse {
  success: boolean
  error: string
  project: ProjectInfo
  orgInference?: OrgInferenceResult
}

export interface UntrackProjectRequest {
  projectPath: string
}

export interface UntrackProjectResponse {
  success: boolean
  error: string
}

export interface GetProjectInfoRequest {
  projectPath: string
}

export interface GetProjectInfoResponse {
  found: boolean
  project: ProjectInfo
}

export interface SetProjectFavoriteRequest {
  projectPath: string
  isFavorite: boolean
}

export interface SetProjectFavoriteResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectArchivedRequest {
  projectPath: string
  isArchived: boolean
}

export interface SetProjectArchivedResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectOrganizationRequest {
  projectPath: string
  organizationSlug: string
}

export interface SetProjectOrganizationResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectUserTitleRequest {
  projectPath: string
  title: string
}

export interface SetProjectUserTitleResponse {
  success: boolean
  error: string
  project: ProjectInfo
}

export interface SetProjectTitleRequest {
  projectPath: string
  title: string
}

export interface SetProjectTitleResponse {
  success: boolean
  error: string
  project: ProjectInfo
}
