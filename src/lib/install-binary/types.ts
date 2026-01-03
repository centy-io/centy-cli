/* eslint-disable single-export/single-export */
export interface InstallOptions {
  version?: string
  onProgress?: (message: string) => void
}

export interface InstallResult {
  binaryPath: string
  version: string
}
