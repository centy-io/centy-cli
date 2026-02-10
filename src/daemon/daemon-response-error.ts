import { tryParseErrorResponse } from './parse-error-response.js'
import type { DaemonErrorResponse } from './types/daemon-error-response.js'

/**
 * Error thrown when a daemon gRPC response is missing expected data.
 * Parses structured JSON error responses from the daemon, falling back
 * to raw string messages for backward compatibility.
 */
export class DaemonResponseError extends Error {
  readonly errorResponse: DaemonErrorResponse | null
  readonly logs: string | undefined
  readonly errorCode: string | undefined
  readonly tip: string | undefined

  constructor(message: string) {
    const result = tryParseErrorResponse(message)

    if (result) {
      super(result.formatted)
      this.errorResponse = result.response
      this.logs = result.response.logs
      this.errorCode = result.code
      this.tip = result.tip
    } else {
      super(message)
      this.errorResponse = null
      this.logs = undefined
      this.errorCode = undefined
      this.tip = undefined
    }

    this.name = 'DaemonResponseError'
  }
}
