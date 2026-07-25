import retry from 'async-retry'
import { checkDaemonConnection } from '../../daemon/check-daemon-connection.js'
import { DaemonNotConnectedError } from './daemon-not-connected-error.js'

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_DELAY_MS = 500

interface WaitOptions {
  maxAttempts?: number
  delayMs?: number
}

export async function waitForDaemon(options?: WaitOptions): Promise<boolean> {
  const retries =
    options !== undefined && options.maxAttempts !== undefined
      ? options.maxAttempts - 1
      : DEFAULT_MAX_ATTEMPTS - 1
  const minTimeout =
    options !== undefined && options.delayMs !== undefined
      ? options.delayMs
      : DEFAULT_DELAY_MS

  try {
    await retry(
      async () => {
        const status = await checkDaemonConnection()
        if (!status.connected) {
          throw new DaemonNotConnectedError()
        }
      },
      {
        retries,
        minTimeout,
        factor: 1,
        randomize: false,
      }
    )
    return true
  } catch {
    return false
  }
}
