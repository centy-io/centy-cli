import type {
  OpenInTempVscodeRequest,
  OpenInTempVscodeResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Open a project in a temporary VS Code workspace
 */
export function daemonOpenInTempVscode(
  request: OpenInTempVscodeRequest
): Promise<OpenInTempVscodeResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.openInTempVscode.bind(client), request)
}
