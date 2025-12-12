import { describe, expect, it } from 'vitest'
import { downloadChecksums } from './download.js'
import { DownloadError } from './errors.js'

describe('downloadChecksums', () => {
  it('should throw DownloadError when checksum asset not found', async () => {
    const release = {
      tag_name: 'v1.0.0',
      assets: [{ name: 'other-file.txt', browser_download_url: '' }],
    }

    await expect(
      // eslint-disable-next-line no-restricted-syntax
      downloadChecksums(release as Parameters<typeof downloadChecksums>[0])
    ).rejects.toThrow(DownloadError)
  })
})
