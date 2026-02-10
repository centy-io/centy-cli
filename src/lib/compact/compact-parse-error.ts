export class CompactParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CompactParseError'
  }
}
