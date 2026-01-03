/* eslint-disable ddd/require-spec-file, single-export/single-export, error/no-generic-error, error/require-custom-error, default/no-hardcoded-urls, no-restricted-syntax */
interface GitHubAsset {
  name: string
  browser_download_url: string
  size: number
}

interface GitHubRelease {
  tag_name: string
  assets: GitHubAsset[]
}

interface ReleaseInfo {
  version: string
  downloadUrl: string
  fileName: string
  size: number
}

const GITHUB_API_BASE = 'https://api.github.com'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<T>
}

export async function getLatestRelease(repo: string): Promise<GitHubRelease> {
  const url = `${GITHUB_API_BASE}/repos/${repo}/releases/latest`
  return fetchJson<GitHubRelease>(url)
}

export async function getReleaseByTag(
  repo: string,
  tag: string
): Promise<GitHubRelease> {
  const url = `${GITHUB_API_BASE}/repos/${repo}/releases/tags/${tag}`
  return fetchJson<GitHubRelease>(url)
}

export function findAsset(
  release: GitHubRelease,
  assetName: string
): GitHubAsset | undefined {
  return release.assets.find(asset => asset.name === assetName)
}

export async function getTuiReleaseInfo(
  assetName: string,
  version?: string
): Promise<ReleaseInfo> {
  const repo = 'centy-io/centy-tui'
  const release =
    version !== undefined
      ? await getReleaseByTag(repo, `v${version}`)
      : await getLatestRelease(repo)

  const asset = findAsset(release, assetName)
  if (asset === undefined) {
    const available = release.assets.map(a => a.name).join(', ')
    throw new Error(
      `Asset "${assetName}" not found in release ${release.tag_name}. Available: ${available}`
    )
  }

  return {
    version: release.tag_name.replace(/^v/, ''),
    downloadUrl: asset.browser_download_url,
    fileName: asset.name,
    size: asset.size,
  }
}

export async function getDaemonReleaseInfo(
  assetPattern: string,
  version?: string
): Promise<ReleaseInfo> {
  const repo = 'centy-io/centy-daemon'
  const release =
    version !== undefined
      ? await getReleaseByTag(repo, `v${version}`)
      : await getLatestRelease(repo)

  const releaseVersion = release.tag_name.replace(/^v/, '')
  const expectedAssetName = assetPattern.replace('{version}', releaseVersion)

  const asset = findAsset(release, expectedAssetName)
  if (asset === undefined) {
    const available = release.assets.map(a => a.name).join(', ')
    throw new Error(
      `Asset "${expectedAssetName}" not found in release ${release.tag_name}. Available: ${available}`
    )
  }

  return {
    version: releaseVersion,
    downloadUrl: asset.browser_download_url,
    fileName: asset.name,
    size: asset.size,
  }
}
