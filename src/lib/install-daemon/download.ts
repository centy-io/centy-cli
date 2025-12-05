import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

import type { GithubRelease } from './types.js'

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
    throw new Error(
      `Failed to download: ${response.status} ${response.statusText}`
    )
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const fileStream = createWriteStream(destPath)
  await pipeline(
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
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
    throw new Error('Checksum file not found in release')
  }

  const response = await fetch(checksumAsset.browser_download_url, {
    headers: {
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download checksums: ${response.status}`)
  }

  return response.text()
}
