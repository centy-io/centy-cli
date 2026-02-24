/* eslint-disable error/no-generic-error, error/require-custom-error, error/no-literal-error-message */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { isWindows } from './platform.js'

function ensureDir(dir: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(dir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
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
    throw new Error(`Unsupported archive format: ${archivePath}`)
  }
}
