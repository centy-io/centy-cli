/* eslint-disable ddd/require-spec-file, single-export/single-export, error/no-generic-error, error/require-custom-error, max-lines, no-restricted-syntax, @typescript-eslint/no-require-imports */
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  chmodSync,
  copyFileSync,
  rmSync,
} from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { tmpdir } from 'node:os'
import { join, basename } from 'node:path'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { isWindows } from './platform.js'

interface DownloadProgress {
  downloaded: number
  total: number
  percent: number
}

type ProgressCallback = (progress: DownloadProgress) => void

export async function downloadFile(
  url: string,
  destPath: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`
    )
  }

  const contentLength = response.headers.get('content-length')
  const total = contentLength !== null ? parseInt(contentLength, 10) : 0

  const destDir = join(destPath, '..')
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(destDir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(destDir, { recursive: true })
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileStream = createWriteStream(destPath)

  if (response.body === null) {
    throw new Error('Response body is null')
  }

  let downloaded = 0
  const reader = response.body.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      fileStream.write(value)
      downloaded += value.length

      if (onProgress !== undefined && total > 0) {
        onProgress({
          downloaded,
          total,
          percent: Math.round((downloaded / total) * 100),
        })
      }
    }
  } finally {
    fileStream.end()
  }
}

function extractTarGz(archivePath: string, destDir: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(destDir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(destDir, { recursive: true })
  }

  execSync(`tar -xzf "${archivePath}" -C "${destDir}"`, { stdio: 'pipe' })
}

function extractZip(archivePath: string, destDir: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(destDir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(destDir, { recursive: true })
  }

  if (isWindows()) {
    // Use PowerShell on Windows
    execSync(
      `powershell -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${destDir}' -Force"`,
      { stdio: 'pipe' }
    )
  } else {
    execSync(`unzip -o "${archivePath}" -d "${destDir}"`, { stdio: 'pipe' })
  }
}

export function extractArchive(archivePath: string, destDir: string): void {
  if (archivePath.endsWith('.tar.gz') || archivePath.endsWith('.tgz')) {
    extractTarGz(archivePath, destDir)
  } else if (archivePath.endsWith('.zip')) {
    extractZip(archivePath, destDir)
  } else {
    throw new Error(`Unsupported archive format: ${archivePath}`)
  }
}

export function makeExecutable(filePath: string): void {
  if (!isWindows()) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    chmodSync(filePath, 0o755)
  }
}

export async function downloadAndExtract(
  url: string,
  binaryName: string,
  destDir: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const tempDir = join(tmpdir(), `centy-install-${randomUUID()}`)
  const fileName = basename(url)
  const downloadPath = join(tempDir, fileName)
  const extractDir = join(tempDir, 'extracted')

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  mkdirSync(tempDir, { recursive: true })

  try {
    // Download the file
    await downloadFile(url, downloadPath, onProgress)

    // Determine if it's an archive or direct binary
    const isArchive =
      fileName.endsWith('.tar.gz') ||
      fileName.endsWith('.tgz') ||
      fileName.endsWith('.zip')

    let sourceBinaryPath: string

    if (isArchive) {
      // Extract archive
      extractArchive(downloadPath, extractDir)

      // Find the binary in extracted contents
      sourceBinaryPath = findBinaryInDir(extractDir, binaryName)
    } else {
      // Direct binary download
      sourceBinaryPath = downloadPath
    }

    // Ensure destination directory exists
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!existsSync(destDir)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      mkdirSync(destDir, { recursive: true })
    }

    // Copy binary to destination
    const destBinaryPath = join(destDir, binaryName)

    copyFileSync(sourceBinaryPath, destBinaryPath)

    // Make executable
    makeExecutable(destBinaryPath)

    return destBinaryPath
  } finally {
    // Cleanup temp directory

    rmSync(tempDir, { recursive: true, force: true })
  }
}

function findBinaryInDir(dir: string, binaryName: string): string {
  // Common locations where the binary might be after extraction
  const possiblePaths = [
    join(dir, binaryName),
    join(dir, binaryName.replace('.exe', '')),
    // For daemon archives that extract to a subdirectory
    ...findFilesRecursive(dir, binaryName),
  ]

  for (const path of possiblePaths) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (existsSync(path)) {
      return path
    }
  }

  throw new Error(`Binary "${binaryName}" not found in extracted archive`)
}

function findFilesRecursive(dir: string, fileName: string): string[] {
  const results: string[] = []
  const { readdirSync, statSync } =
    require('node:fs') as typeof import('node:fs')

  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)

      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results.push(...findFilesRecursive(fullPath, fileName))
      } else if (entry === fileName || entry === fileName.replace('.exe', '')) {
        results.push(fullPath)
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return results
}
