/* eslint-disable single-export/single-export */

import { getDaemonClient } from './load-proto.js'

export interface DaemonConnectionStatus {
  connected: boolean
  error?: string
}

/**
 * Check if daemon is running and accessible
 * Uses getDaemonInfo as a lightweight health check
 */
export async function checkDaemonConnection(): Promise<DaemonConnectionStatus> {
  return new Promise(resolve => {
    const client = getDaemonClient()

    // Set a timeout for the connection check
    const timeout = setTimeout(() => {
      resolve({
        connected: false,
        error: 'Connection timeout - daemon may not be running',
      })
    }, 5000)

    client.getDaemonInfo({}, (error, response) => {
      clearTimeout(timeout)

      if (error) {
        // eslint-disable-next-line no-restricted-syntax
        const msg = error.message ?? String(error)
        if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
          resolve({
            connected: false,
            error:
              'Centy daemon is not running. Please start the daemon first.',
          })
          return
        }
        resolve({
          connected: false,
          error: `Daemon connection error: ${msg}`,
        })
        return
      }

      if (response) {
        resolve({ connected: true })
      } else {
        resolve({
          connected: false,
          error: 'No response from daemon',
        })
      }
    })
  })
}
