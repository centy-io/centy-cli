/* eslint-disable single-export/single-export */
/**
 * User lifecycle (soft delete, restore, sync) types
 * for daemon gRPC communication.
 */

import type { Manifest } from './init.js'
import type { User } from './user.js'

export interface SoftDeleteUserRequest {
  projectPath: string
  userId: string
}

export interface SoftDeleteUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface RestoreUserRequest {
  projectPath: string
  userId: string
}

export interface RestoreUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface GitContributor {
  name: string
  email: string
}

export interface SyncUsersRequest {
  projectPath: string
  dryRun: boolean
}

export interface SyncUsersResponse {
  success: boolean
  error: string
  created: string[]
  skipped: string[]
  errors: string[]
  wouldCreate: GitContributor[]
  wouldSkip: GitContributor[]
  manifest?: Manifest
}
