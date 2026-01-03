/* eslint-disable ddd/require-spec-file */
import { installTui } from './install-tui.js'
import { installDaemon } from './install-daemon.js'
import type { InstallOptions, InstallResult } from './types.js'

function noop(): void {
  // empty progress callback
}

export async function installAll(
  options: InstallOptions
): Promise<InstallResult[]> {
  const onProgress = options.onProgress
  const log = onProgress !== undefined ? onProgress : noop

  log('Installing all centy binaries...')

  const tuiResult = await installTui({
    ...options,
    onProgress: msg => log(`[tui] ${msg}`),
  })

  const daemonResult = await installDaemon({
    ...options,
    onProgress: msg => log(`[daemon] ${msg}`),
  })

  return [tuiResult, daemonResult]
}
