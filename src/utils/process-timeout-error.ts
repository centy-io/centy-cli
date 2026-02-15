export class ProcessTimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation '${operation}' timed out after ${timeoutMs}ms. The process may be hanging or waiting for input.`
    )
    this.name = 'ProcessTimeoutError'
  }
}
