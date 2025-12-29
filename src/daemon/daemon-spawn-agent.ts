import type { SpawnAgentRequest, SpawnAgentResponse } from './types.js'
import {
  getDaemonClient,
  callWithDeadline,
  LONG_GRPC_TIMEOUT_MS,
} from './load-proto.js'

/**
 * Spawn an LLM agent to work on an issue
 */
export function daemonSpawnAgent(
  request: SpawnAgentRequest
): Promise<SpawnAgentResponse> {
  const client = getDaemonClient()
  return callWithDeadline(
    client.spawnAgent.bind(client),
    request,
    LONG_GRPC_TIMEOUT_MS
  )
}
