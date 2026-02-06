/**
 * Error thrown when a daemon gRPC response is missing expected data
 */
export class DaemonResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DaemonResponseError'
  }
}
