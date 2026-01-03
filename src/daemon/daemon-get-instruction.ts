import type { GetInstructionRequest, GetInstructionResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get instruction.md content via daemon
 */
export function daemonGetInstruction(
  request: GetInstructionRequest
): Promise<GetInstructionResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getInstruction.bind(client), request)
}
