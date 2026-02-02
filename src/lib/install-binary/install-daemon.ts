/* eslint-disable ddd/require-spec-file */
import { getDaemonAssetPattern, getBinaryFileName } from './platform.js'
import { getDaemonReleaseInfo, getLatestRelease } from './github-release.js'
import { downloadAndExtract } from './download.js'
import { getInstallDir } from './get-install-dir.js'
import { getInstalledDaemonVersion } from './get-installed-version.js'
import { isPrerelease, isNewerVersion } from './prerelease.js'
import type { InstallOptions, InstallResult } from './types.js'

function noop(): void {
  // empty progress callback
}

async function checkForNewerPrerelease(
  installedVersion: string
): Promise<string | undefined> {
  // Only check if user is on a prerelease
  if (!isPrerelease(installedVersion)) {
    return undefined
  }

  try {
    // Fetch the latest prerelease
    const latestPrerelease = await getLatestRelease(
      'centy-io/centy-daemon',
      true
    )
    const latestVersion = latestPrerelease.tag_name.replace(/^v/, '')

    // Check if the latest prerelease is newer than the installed version
    if (isNewerVersion(installedVersion, latestVersion)) {
      return latestVersion
    }
  } catch {
    // Silently ignore errors when checking for prerelease updates
  }

  return undefined
}

export async function installDaemon(
  options: InstallOptions
): Promise<InstallResult> {
  const version = options.version
  const prerelease =
    options.prerelease !== undefined ? options.prerelease : false
  const onProgress = options.onProgress
  const log = onProgress !== undefined ? onProgress : noop

  // Check for newer prerelease if user is not explicitly requesting prerelease
  // and no specific version was requested
  let newerPrereleaseAvailable: string | undefined
  if (!prerelease && version === undefined) {
    const installedVersion = getInstalledDaemonVersion()
    if (installedVersion !== undefined) {
      newerPrereleaseAvailable = await checkForNewerPrerelease(installedVersion)
    }
  }

  log('Detecting platform...')

  // For daemon, we need the version to construct the asset name
  // If no version specified, fetch the latest release first
  let targetVersion = version
  if (targetVersion === undefined) {
    log('Fetching latest release info...')
    const latestRelease = await getLatestRelease(
      'centy-io/centy-daemon',
      prerelease
    )
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
    newerPrereleaseAvailable,
  }
}
