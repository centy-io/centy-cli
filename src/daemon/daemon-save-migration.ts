import type { SaveMigrationRequest, SaveMigrationResponse } from './types.js'
import {
  getDaemonClient,
  callWithDeadline,
  LONG_GRPC_TIMEOUT_MS,
} from './load-proto.js'

/**
 * Save a migration file via daemon
 */
export function daemonSaveMigration(
  request: SaveMigrationRequest
): Promise<SaveMigrationResponse> {
  const client = getDaemonClient()
  return callWithDeadline(
    client.saveMigration.bind(client),
    request,
    LONG_GRPC_TIMEOUT_MS
  )
}
