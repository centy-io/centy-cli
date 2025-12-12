/* eslint-disable max-lines */

import { existsSync } from 'node:fs'
import { mkdir, chmod, rm, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { fetchLatestRelease, fetchRelease } from './github-api.js'
import { downloadAsset, downloadChecksums } from './download.js'
import { extractArchive } from './extract.js'
import { verifyChecksum } from './checksum.js'
import { getPlatformTarget } from './platform.js'
import type {
  InstallDaemonOptions,
  InstallDaemonResult,
  GithubRelease,
  PlatformTarget,
} from './types.js'

const INSTALL_DIR = join(homedir(), '.centy', 'bin')
const DAEMON_BINARY_NAME = 'centy-daemon'

async function downloadAndVerifyAsset(
  release: GithubRelease,
  platformTarget: PlatformTarget,
  assetName: string,
  archivePath: string,
  skipChecksum: boolean,
  log: (msg: string) => void,
  warn: (msg: string) => void
): Promise<boolean> {
  log(`Downloading ${assetName}...`)
  const asset = release.assets.find(a => a.name === assetName)
  if (!asset) {
    return false
  }

  await downloadAsset(asset.browser_download_url, archivePath)

  if (!skipChecksum) {
    log('Verifying checksum...')
    const checksums = await downloadChecksums(release)
    const valid = await verifyChecksum(archivePath, assetName, checksums)
    if (!valid) {
      await rm(archivePath, { force: true })
      return false
    }
    log('Checksum verified')
  } else {
    warn('Skipping checksum verification')
  }

  return true
}

async function finalizeInstallation(
  extractedPath: string,
  binaryName: string
): Promise<string> {
  const finalPath = join(INSTALL_DIR, binaryName)
  if (extractedPath !== finalPath) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (existsSync(finalPath)) {
      await rm(finalPath, { force: true })
    }
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await rename(extractedPath, finalPath)
  }

  if (process.platform !== 'win32') {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await chmod(finalPath, 0o755)
  }

  return finalPath
}

export async function installDaemon(
  options?: InstallDaemonOptions
): Promise<InstallDaemonResult> {
  // eslint-disable-next-line no-restricted-syntax
  const opts = options ?? {}
  // eslint-disable-next-line no-restricted-syntax
  const log = opts.log ?? console.log
  // eslint-disable-next-line no-restricted-syntax
  const warn = opts.warn ?? console.warn

  try {
    const platformTarget = getPlatformTarget()
    log(`Detected platform: ${platformTarget.target}`)

    const binaryName =
      platformTarget.platform === 'win32'
        ? `${DAEMON_BINARY_NAME}.exe`
        : DAEMON_BINARY_NAME
    const binaryPath = join(INSTALL_DIR, binaryName)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!opts.force && existsSync(binaryPath)) {
      return {
        success: false,
        error: `Daemon already installed at ${binaryPath}. Use --force to reinstall.`,
      }
    }

    log('Fetching release information...')
    const release = opts.version
      ? await fetchRelease(opts.version)
      : await fetchLatestRelease()

    const version = release.tag_name.replace(/^v/, '')
    log(`Installing version ${version}`)

    const assetName = `centy-daemon-${release.tag_name}-${platformTarget.target}.${platformTarget.extension}`

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await mkdir(INSTALL_DIR, { recursive: true })

    const archivePath = join(INSTALL_DIR, assetName)
    const downloadSuccess = await downloadAndVerifyAsset(
      release,
      platformTarget,
      assetName,
      archivePath,
      // eslint-disable-next-line no-restricted-syntax
      opts.skipChecksum ?? false,
      log,
      warn
    )

    if (!downloadSuccess) {
      return {
        success: false,
        error: opts.skipChecksum
          ? `No binary found for platform ${platformTarget.target} in release ${version}`
          : 'Checksum verification failed',
      }
    }

    log('Extracting...')
    const extractedPath = await extractArchive(
      archivePath,
      INSTALL_DIR,
      platformTarget.extension
    )

    const finalPath = await finalizeInstallation(extractedPath, binaryName)
    await rm(archivePath, { force: true })

    return {
      success: true,
      version,
      installPath: finalPath,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: msg,
    }
  }
}
