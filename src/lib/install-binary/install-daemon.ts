/* eslint-disable ddd/require-spec-file */
import { getDaemonAssetPattern, getBinaryFileName } from './platform.js'
import { getDaemonReleaseInfo, getLatestRelease } from './github-release.js'
import { downloadAndExtract } from './download.js'
import { getInstallDir } from './get-install-dir.js'
import type { InstallOptions, InstallResult } from './types.js'

function noop(): void {
  // empty progress callback
}

export async function installDaemon(
  options: InstallOptions
): Promise<InstallResult> {
  const version = options.version
  const onProgress = options.onProgress
  const log = onProgress !== undefined ? onProgress : noop

  log('Detecting platform...')

  // For daemon, we need the version to construct the asset name
  // If no version specified, fetch the latest release first
  let targetVersion = version
  if (targetVersion === undefined) {
    log('Fetching latest release info...')
    const latestRelease = await getLatestRelease('centy-io/centy-daemon')
    targetVersion = latestRelease.tag_name.replace(/^v/, '')
  }

  const assetPattern = getDaemonAssetPattern(targetVersion)

  log(`Fetching release info for centy-daemon v${targetVersion}...`)
  // Pass the pattern with {version} placeholder for getDaemonReleaseInfo
  const assetSuffix = assetPattern.split(`v${targetVersion}-`)[1]
  const releaseInfo = await getDaemonReleaseInfo(
    `centy-daemon-v{version}-${assetSuffix}`,
    targetVersion
  )

  log(`Downloading centy-daemon v${releaseInfo.version}...`)
  const binaryName = getBinaryFileName('centy-daemon')
  const installDir = getInstallDir()

  const binaryPath = await downloadAndExtract(
    releaseInfo.downloadUrl,
    binaryName,
    installDir,
    progress => {
      log(`Downloading... ${progress.percent}%`)
    }
  )

  log(`Installed centy-daemon v${releaseInfo.version} to ${binaryPath}`)

  return {
    binaryPath,
    version: releaseInfo.version,
  }
}
