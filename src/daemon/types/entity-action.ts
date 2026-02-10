/* eslint-disable single-export/single-export */
/**
 * Entity action types for daemon gRPC communication.
 */

export interface EntityAction {
  id: string
  label: string
  category: string
  enabled: boolean
  disabledReason: string
  destructive: boolean
  keyboardShortcut: string
}

export interface GetEntityActionsRequest {
  projectPath: string
  entityType: string
  entityId?: string
}

export interface GetEntityActionsResponse {
  actions: EntityAction[]
  success: boolean
  error: string
}
