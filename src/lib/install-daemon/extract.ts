import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { isWindows } from './platform.js'

export class UnsupportedArchiveFormatError extends Error {
  constructor(archivePath: string) {
    super(`Unsupported archive format: ${archivePath}`)
    this.name = 'UnsupportedArchiveFormatError'
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function extractTarGz(archivePath: string, destDir: string): void {
  ensureDir(destDir)
  execSync(`tar -xzf "${archivePath}" -C "${destDir}"`, { stdio: 'pipe' })
}

function extractZip(archivePath: string, destDir: string): void {
  ensureDir(destDir)
  if (isWindows()) {
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
    throw new UnsupportedArchiveFormatError(archivePath)
  }
}
