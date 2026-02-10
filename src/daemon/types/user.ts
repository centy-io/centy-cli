/* eslint-disable single-export/single-export */
/**
 * User types for daemon gRPC communication.
 */

import type { Manifest } from './init.js'

export interface User {
  id: string
  name: string
  email: string
  gitUsernames: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export interface CreateUserRequest {
  projectPath: string
  id: string
  name: string
  email?: string
  gitUsernames?: string[]
}

export interface CreateUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface GetUserRequest {
  projectPath: string
  userId: string
}

export interface GetUserResponse {
  success: boolean
  error: string
  user?: User
}

export interface ListUsersRequest {
  projectPath: string
  gitUsername?: string
  includeDeleted?: boolean
}

export interface ListUsersResponse {
  users: User[]
  totalCount: number
}

export interface UpdateUserRequest {
  projectPath: string
  userId: string
  name?: string
  email?: string
  gitUsernames?: string[]
}

export interface UpdateUserResponse {
  success: boolean
  error: string
  user?: User
  manifest?: Manifest
}

export interface DeleteUserRequest {
  projectPath: string
  userId: string
}

export interface DeleteUserResponse {
  success: boolean
  error: string
  manifest?: Manifest
}
