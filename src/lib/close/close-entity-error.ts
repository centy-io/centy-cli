export class CloseEntityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CloseEntityError'
  }
}
