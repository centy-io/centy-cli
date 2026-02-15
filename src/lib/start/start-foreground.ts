import { spawn } from 'node:child_process'
import { ProcessTimeoutError } from '../../utils/process-timeout-error.js'

export async function startForeground(
  daemonPath: string,
  log: (msg: string) => void,
  handleError: (err: Error) => void,
  timeoutMs?: number
): Promise<void> {
  log('Starting daemon in foreground mode...')
  const child = spawn(daemonPath, [], { stdio: 'inherit' })
  child.on('error', error => handleError(error))

  await new Promise<void>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (timeoutMs !== undefined) {
      timeoutId = setTimeout(() => {
        child.kill()
        reject(new ProcessTimeoutError('foreground daemon', timeoutMs))
      }, timeoutMs)
    }

    child.on('exit', code => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      if (code === 0) resolve()
      else reject(new Error(`Daemon exited with code ${code}`))
    })
  })
}
