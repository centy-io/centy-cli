import type { GithubRelease } from './types.js'

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'centy-io'
const REPO_NAME = 'centy-daemon'

export async function fetchLatestRelease(): Promise<GithubRelease> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch latest release: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<GithubRelease>
}

export async function fetchRelease(version: string): Promise<GithubRelease> {
  const tag = version.startsWith('v') ? version : `v${version}`
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tag}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Release ${tag} not found`)
    }
    throw new Error(
      `Failed to fetch release ${tag}: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<GithubRelease>
}
