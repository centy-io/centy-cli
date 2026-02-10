/* eslint-disable single-export/single-export */
/**
 * Pull request search types for daemon gRPC communication.
 */

import type { PullRequest } from './pr.js'

export interface GetPrsByUuidRequest {
  uuid: string
}

export interface PrWithProject {
  pr: PullRequest
  projectPath: string
  projectName: string
  displayPath: string
}

export interface GetPrsByUuidResponse {
  prs: PrWithProject[]
  totalCount: number
  errors: string[]
}
