/* eslint-disable single-export/single-export */
/**
 * Configuration types for daemon gRPC communication.
 */

export interface GetConfigRequest {
  projectPath: string
}

export interface GetConfigResponse {
  success: boolean
  error: string
  config?: Config
}

export interface LlmConfig {
  autoCloseOnComplete: boolean
  updateStatusOnStart?: boolean
  allowDirectEdits: boolean
  defaultWorkspaceMode?: string
}

export interface LinkTypeDefinition {
  name: string
  inverse: string
  description: string
}

export interface HookDefinition {
  pattern: string
  command: string
  runAsync: boolean
  timeout: number
  enabled: boolean
}

export interface Config {
  customFields: CustomFieldDefinition[]
  defaults: Record<string, string>
  priorityLevels: number
  allowedStates: string[]
  defaultState: string
  version: string
  stateColors: Record<string, string>
  priorityColors: Record<string, string>
  llm: LlmConfig
  customLinkTypes: LinkTypeDefinition[]
  defaultEditor: string
  hooks: HookDefinition[]
}

export interface UpdateConfigRequest {
  projectPath: string
  config: Config
}

export interface UpdateConfigResponse {
  success: boolean
  error: string
  config: Config
}

export interface CustomFieldDefinition {
  name: string
  fieldType: string
  required: boolean
  defaultValue: string
  enumValues: string[]
}
