import { chmodSync } from 'node:fs'
import { isWindows } from './platform.js'

export function makeExecutable(filePath: string): void {
  if (!isWindows()) {

    chmodSync(filePath, 0o755)
  }
}
