/* eslint-disable single-export/single-export */

export function isWindows(): boolean {
  return process.platform === 'win32'
}

export function getBinaryFileName(binaryName: string): string {
  return isWindows() ? `${binaryName}.exe` : binaryName
}

export function getArchiveExtension(): string {
  return isWindows() ? 'zip' : 'tar.gz'
}
