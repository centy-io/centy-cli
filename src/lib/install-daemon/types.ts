export interface InstallDaemonOptions {
  version?: string
  force?: boolean
  skipChecksum?: boolean
  log?: (msg: string) => void
  warn?: (msg: string) => void
}

export interface InstallDaemonResult {
  success: boolean
  version?: string
  installPath?: string
  error?: string
}

export interface GithubRelease {
  tag_name: string
  assets: GithubAsset[]
}

export interface GithubAsset {
  name: string
  browser_download_url: string
}

export type Platform = 'linux' | 'darwin' | 'win32'
export type Architecture = 'x64' | 'arm64'

export interface PlatformTarget {
  platform: Platform
  arch: Architecture
  target: string
  extension: 'tar.gz' | 'zip'
}
