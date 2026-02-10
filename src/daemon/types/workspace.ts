/* eslint-disable single-export/single-export */
/**
 * Workspace and editor types for daemon gRPC communication.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetSupportedEditorsRequest {}

export interface EditorInfo {
  editorType: string
  name: string
  description: string
  available: boolean
  editorId: string
  terminalWrapper: boolean
}

export interface GetSupportedEditorsResponse {
  editors: EditorInfo[]
}

export interface OpenInTempWorkspaceWithEditorRequest {
  projectPath: string
  issueId: string
  action: string
  agentName?: string
  ttlHours?: number
  editorId?: string
}

export interface OpenStandaloneWorkspaceWithEditorRequest {
  projectPath: string
  name?: string
  description?: string
  ttlHours?: number
  agentName?: string
  editorId?: string
}

export interface OpenInTempWorkspaceRequest {
  projectPath: string
  issueId: string
  action: string
  agentName?: string
  ttlHours?: number
}

export interface OpenInTempWorkspaceResponse {
  success: boolean
  error: string
  workspacePath: string
  issueId: string
  displayNumber: number
  expiresAt: string
  editorOpened: boolean
  requiresStatusConfig: boolean
  workspaceReused: boolean
  originalCreatedAt: string
}

export interface OpenAgentInTerminalRequest {
  projectPath: string
  issueId: string
  agentName?: string
  workspaceMode?: string
  ttlHours?: number
}

export interface OpenAgentInTerminalResponse {
  success: boolean
  error: string
  workingDirectory: string
  issueId: string
  displayNumber: number
  agentCommand: string
  terminalOpened: boolean
  expiresAt: string
  requiresStatusConfig: boolean
}
