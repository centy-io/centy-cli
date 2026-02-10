/* eslint-disable single-export/single-export */
/**
 * Issue search types for daemon gRPC communication.
 */

import type { Issue } from './issue.js'

export interface GetIssuesByUuidRequest {
  uuid: string
}

export interface IssueWithProject {
  issue: Issue
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GetIssuesByUuidResponse {
  issues: IssueWithProject[]
  totalCount: number
  errors: string[]
}

export interface AdvancedSearchRequest {
  query: string
  sortBy?: string
  sortDescending?: boolean
  multiProject?: boolean
  projectPath?: string
}

export interface SearchResultIssue {
  issue: Issue
  projectPath: string
  projectName: string
  displayPath: string
}

export interface AdvancedSearchResponse {
  success: boolean
  error: string
  results: SearchResultIssue[]
  totalCount: number
  parsedQuery: string
}
