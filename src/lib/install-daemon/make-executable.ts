import { chmodSync } from 'node:fs'
import { isWindows } from './platform.js'

export function makeExecutable(filePath: string): void {
  if (!isWindows()) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    chmodSync(filePath, 0o755)
  }
}
