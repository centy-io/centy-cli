/* eslint-disable ddd/require-spec-file */
import { homedir } from 'node:os'
import { join } from 'node:path'

export function getInstallDir(): string {
  return join(homedir(), '.centy', 'bin')
}
