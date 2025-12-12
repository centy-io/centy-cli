/* eslint-disable single-export/single-export */
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import type { GithubRelease } from './types.js'
import { DownloadError } from './errors.js'

/**
 * Download operations for daemon installation
 * Multiple exports allowed for related download operations
 */
export async function downloadAsset(
  url: string,
  destPath: string
): Promise<void> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new DownloadError(
      `Failed to download: ${response.status} ${response.statusText}`
    )
  }

  if (!response.body) {
    throw new DownloadError('No response body')
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileStream = createWriteStream(destPath)
  await pipeline(
    Readable.fromWeb(
      // eslint-disable-next-line no-restricted-syntax
      response.body as unknown as Parameters<typeof Readable.fromWeb>[0]
    ),
    fileStream
  )
}

export async function downloadChecksums(
  release: GithubRelease
): Promise<string> {
  const checksumAsset = release.assets.find(
    a => a.name === 'checksums-sha256.txt'
  )
  if (!checksumAsset) {
    throw new DownloadError('Checksum file not found in release')
  }

  const response = await fetch(checksumAsset.browser_download_url, {
    headers: {
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new DownloadError(`Failed to download checksums: ${response.status}`)
  }

  return response.text()
}
