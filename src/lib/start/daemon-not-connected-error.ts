export class DaemonNotConnectedError extends Error {
  constructor() {
    super('Daemon not connected')
    this.name = 'DaemonNotConnectedError'
  }
}
