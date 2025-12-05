import { existsSync } from 'node:fs'
import { mkdir, chmod, rm, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

import { fetchLatestRelease, fetchRelease } from './github-api.js'
import { downloadAsset, downloadChecksums } from './download.js'
import { extractArchive } from './extract.js'
import { verifyChecksum } from './checksum.js'
import { getPlatformTarget } from './platform.js'
import type { InstallDaemonOptions, InstallDaemonResult } from './types.js'

const INSTALL_DIR = join(homedir(), '.centy', 'bin')
const DAEMON_BINARY_NAME = 'centy-daemon'

export async function installDaemon(
  options?: InstallDaemonOptions
): Promise<InstallDaemonResult> {
  const opts = options ?? {}
  const log = opts.log ?? console.log
  const warn = opts.warn ?? console.warn

  try {
    const platformTarget = getPlatformTarget()
    log(`Detected platform: ${platformTarget.target}`)

    const binaryName =
      platformTarget.platform === 'win32'
        ? `${DAEMON_BINARY_NAME}.exe`
        : DAEMON_BINARY_NAME
    const binaryPath = join(INSTALL_DIR, binaryName)

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
    const asset = release.assets.find(a => a.name === assetName)
    if (!asset) {
      return {
        success: false,
        error: `No binary found for platform ${platformTarget.target} in release ${version}`,
      }
    }

    await mkdir(INSTALL_DIR, { recursive: true })

    log(`Downloading ${assetName}...`)
    const archivePath = join(INSTALL_DIR, assetName)
    await downloadAsset(asset.browser_download_url, archivePath)

    if (!opts.skipChecksum) {
      log('Verifying checksum...')
      const checksums = await downloadChecksums(release)
      const valid = await verifyChecksum(archivePath, assetName, checksums)
      if (!valid) {
        await rm(archivePath, { force: true })
        return {
          success: false,
          error: 'Checksum verification failed',
        }
      }
      log('Checksum verified')
    } else {
      warn('Skipping checksum verification')
    }

    log('Extracting...')
    const extractedPath = await extractArchive(
      archivePath,
      INSTALL_DIR,
      platformTarget.extension
    )

    const finalPath = join(INSTALL_DIR, binaryName)
    if (extractedPath !== finalPath) {
      if (existsSync(finalPath)) {
        await rm(finalPath, { force: true })
      }
      await rename(extractedPath, finalPath)
    }

    if (process.platform !== 'win32') {
      await chmod(finalPath, 0o755)
    }

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
