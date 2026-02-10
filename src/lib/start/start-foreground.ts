import { spawn } from 'node:child_process'

export async function startForeground(
  daemonPath: string,
  log: (msg: string) => void,
  handleError: (err: Error) => void
): Promise<void> {
  log('Starting daemon in foreground mode...')
  const child = spawn(daemonPath, [], { stdio: 'inherit' })
  child.on('error', error => handleError(error))

  await new Promise<void>((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`Daemon exited with code ${code}`))
    })
  })
}
