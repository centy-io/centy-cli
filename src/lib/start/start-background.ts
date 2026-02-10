import { spawn } from 'node:child_process'
import { waitForDaemon } from './wait-for-daemon.js'

export async function startBackground(
  daemonPath: string,
  log: (msg: string) => void,
  handleError: (err: Error) => void
): Promise<boolean> {
  log('Starting daemon in background...')
  const child = spawn(daemonPath, [], { detached: true, stdio: 'ignore' })
  let spawnError: Error | null = null
  child.on('error', error => {
    spawnError = error
  })

  child.unref()
  const started = await waitForDaemon()
  if (spawnError) {
    handleError(spawnError)
    return false
  }

  return started
}
