import { checkDaemonConnection } from '../../daemon/check-daemon-connection.js'

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_DELAY_MS = 500

interface WaitOptions {
  maxAttempts?: number
  delayMs?: number
}

export async function waitForDaemon(options?: WaitOptions): Promise<boolean> {
  const maxAttempts =
    options !== undefined && options.maxAttempts !== undefined
      ? options.maxAttempts
      : DEFAULT_MAX_ATTEMPTS
  const delayMs =
    options !== undefined && options.delayMs !== undefined
      ? options.delayMs
      : DEFAULT_DELAY_MS

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    const status = await checkDaemonConnection()
    if (status.connected) {
      return true
    }
  }
  return false
}
