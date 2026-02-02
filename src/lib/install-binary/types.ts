/* eslint-disable single-export/single-export */
export interface InstallOptions {
  version?: string
  prerelease?: boolean
  onProgress?: (message: string) => void
}

export interface InstallResult {
  binaryPath: string
  version: string
}
