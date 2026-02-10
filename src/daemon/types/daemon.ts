/* eslint-disable single-export/single-export */
/**
 * Daemon control and info types for daemon gRPC communication.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetDaemonInfoRequest {}

export interface DaemonInfo {
  version: string
  binaryPath: string
  vscodeAvailable: boolean
}

export interface ShutdownRequest {
  delaySeconds?: number
}

export interface ShutdownResponse {
  success: boolean
  message: string
}

export interface RestartRequest {
  delaySeconds?: number
}

export interface RestartResponse {
  success: boolean
  message: string
}
