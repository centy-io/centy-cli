import { spawn } from 'node:child_process'
import { join } from 'node:path'

import { extract as tarExtract } from 'tar'

const DAEMON_BINARY_NAME = 'centy-daemon'

export async function extractArchive(
  archivePath: string,
  destDir: string,
  format: 'tar.gz' | 'zip'
): Promise<string> {
  if (format === 'tar.gz') {
    return extractTarGz(archivePath, destDir)
  } else {
    return extractZip(archivePath, destDir)
  }
}

async function extractTarGz(
  archivePath: string,
  destDir: string
): Promise<string> {
  await tarExtract({
    file: archivePath,
    cwd: destDir,
    filter: path => path.includes(DAEMON_BINARY_NAME),
  })

  return join(destDir, DAEMON_BINARY_NAME)
}

async function extractZip(
  archivePath: string,
  destDir: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('powershell', [
      '-Command',
      `Expand-Archive -Path "${archivePath}" -DestinationPath "${destDir}" -Force`,
    ])

    proc.on('close', code => {
      if (code === 0) {
        resolve(join(destDir, `${DAEMON_BINARY_NAME}.exe`))
      } else {
        reject(new Error(`Failed to extract zip: exit code ${code}`))
      }
    })

    proc.on('error', reject)
  })
}
