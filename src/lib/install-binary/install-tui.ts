/* eslint-disable ddd/require-spec-file */
import { getTuiAssetName, getBinaryFileName } from './platform.js'
import { getTuiReleaseInfo } from './github-release.js'
import { downloadAndExtract } from './download.js'
import { getInstallDir } from './get-install-dir.js'
import type { InstallOptions, InstallResult } from './types.js'

function noop(): void {
  // empty progress callback
}

export async function installTui(
  options: InstallOptions
): Promise<InstallResult> {
  const version = options.version
  const onProgress = options.onProgress
  const log = onProgress !== undefined ? onProgress : noop

  log('Detecting platform...')
  const assetName = getTuiAssetName()

  const versionSuffix = version !== undefined ? ` v${version}` : ''
  log(`Fetching release info for centy-tui${versionSuffix}...`)
  const releaseInfo = await getTuiReleaseInfo(assetName, version)

  log(`Downloading centy-tui v${releaseInfo.version}...`)
  const binaryName = getBinaryFileName('centy-tui')
  const installDir = getInstallDir()

  const binaryPath = await downloadAndExtract(
    releaseInfo.downloadUrl,
    binaryName,
    installDir,
    progress => {
      log(`Downloading... ${progress.percent}%`)
    }
  )

  log(`Installed centy-tui v${releaseInfo.version} to ${binaryPath}`)

  return {
    binaryPath,
    version: releaseInfo.version,
  }
}
