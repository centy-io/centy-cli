/* eslint-disable ddd/require-spec-file, single-export/single-export, error/no-generic-error, error/require-custom-error, no-optional-chaining/no-optional-chaining */
import { arch, platform } from 'node:os'

interface PlatformInfo {
  os: NodeJS.Platform
  arch: string
}

function getPlatformInfo(): PlatformInfo {
  return {
    os: platform(),
    arch: arch(),
  }
}

function getTuiAssetSuffix(): string {
  const info = getPlatformInfo()

  const osMap: Record<string, string> = {
    darwin: 'darwin',
    linux: 'linux',
    win32: 'windows',
  }

  const archMap: Record<string, string> = {
    arm64: 'aarch64',
    x64: 'x86_64',
  }

  const osName = osMap[info.os]
  const archName = archMap[info.arch]

  if (osName === undefined || archName === undefined) {
    throw new Error(`Unsupported platform: ${info.os}-${info.arch}`)
  }

  return `${osName}-${archName}`
}

function getDaemonTargetTriple(): string {
  const info = getPlatformInfo()

  const targetMap: Record<string, Record<string, string>> = {
    darwin: {
      arm64: 'aarch64-apple-darwin',
      x64: 'x86_64-apple-darwin',
    },
    linux: {
      arm64: 'aarch64-unknown-linux-gnu',
      x64: 'x86_64-unknown-linux-gnu',
    },
    win32: {
      x64: 'x86_64-pc-windows-msvc',
    },
  }

  const osTargets = targetMap[info.os]

  const target = osTargets?.[info.arch]

  if (target === undefined) {
    throw new Error(`Unsupported platform: ${info.os}-${info.arch}`)
  }

  return target
}

export function getTuiAssetName(): string {
  const suffix = getTuiAssetSuffix()
  const isWindows = platform() === 'win32'
  return `centy-tui-${suffix}${isWindows ? '.exe' : ''}`
}

export function getDaemonAssetPattern(version: string): string {
  const target = getDaemonTargetTriple()
  const isWindows = platform() === 'win32'
  const extension = isWindows ? 'zip' : 'tar.gz'
  return `centy-daemon-v${version}-${target}.${extension}`
}

export function isWindows(): boolean {
  return platform() === 'win32'
}

export function getBinaryFileName(binaryName: string): string {
  return isWindows() ? `${binaryName}.exe` : binaryName
}
