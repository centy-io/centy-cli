import type { SaveMigrationRequest, SaveMigrationResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Save a migration file via daemon
 */
export function daemonSaveMigration(
  request: SaveMigrationRequest
): Promise<SaveMigrationResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().saveMigration(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
