import type { GetInstructionRequest, GetInstructionResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get instruction.md content via daemon
 */
export function daemonGetInstruction(
  request: GetInstructionRequest
): Promise<GetInstructionResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getInstruction(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
