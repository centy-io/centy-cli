import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { ChecksumNotFoundError } from './errors.js'

export async function verifyChecksum(
  filePath: string,
  fileName: string,
  checksumContent: string
): Promise<boolean> {
  const lines = checksumContent.trim().split('\n')
  const checksumMap = new Map<string, string>()

  for (const line of lines) {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/)
    if (match) {
      checksumMap.set(match[2], match[1])
    }
  }

  const expectedHash = checksumMap.get(fileName)
  if (!expectedHash) {
    throw new ChecksumNotFoundError(fileName)
  }

  const actualHash = await calculateSha256(filePath)
  return actualHash === expectedHash
}

async function calculateSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const stream = createReadStream(filePath)

    stream.on('data', chunk => {
      hash.update(chunk)
    })
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}
