import type { PlatformTarget, Platform, Architecture } from './types.js'
import { PlatformNotSupportedError } from './errors.js'

const TARGET_MAP: Record<string, string> = {
  'linux-x64': 'x86_64-unknown-linux-gnu',
  'linux-arm64': 'aarch64-unknown-linux-gnu',
  'darwin-x64': 'x86_64-apple-darwin',
  'darwin-arm64': 'aarch64-apple-darwin',
  'win32-x64': 'x86_64-pc-windows-msvc',
}

export function getPlatformTarget(): PlatformTarget {
  // eslint-disable-next-line no-restricted-syntax
  const platform = process.platform as Platform
  // eslint-disable-next-line no-restricted-syntax
  const arch = process.arch as Architecture

  const key = `${platform}-${arch}`
  // eslint-disable-next-line security/detect-object-injection
  const target = TARGET_MAP[key]

  if (!target) {
    throw new PlatformNotSupportedError(platform, arch)
  }

  return {
    platform,
    arch,
    target,
    extension: platform === 'win32' ? 'zip' : 'tar.gz',
  }
}
